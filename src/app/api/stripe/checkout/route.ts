import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { planId } = await req.json();

    const user = await prisma.user.findUnique({
        where: { clerkId }
    });

    if (!user) {
        return new NextResponse("User not found", { status: 404 });
    }

    // Production plans (matching billing.js from Shopify app)
    const plans: Record<string, { name: string, price: number, credits: number }> = {
        "basic": { name: "Basic Plan", price: 4800, credits: 100 },
        "standard": { name: "Standard Plan", price: 9900, credits: 300 },
        "pro": { name: "Pro Plan", price: 19900, credits: 1000 },
    };

    const plan = plans[planId];
    if (!plan) {
        return new NextResponse("Invalid plan", { status: 400 });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: plan.name,
                            description: `${plan.credits} credits for UGC Studio`,
                        },
                        unit_amount: plan.price,
                        recurring: { interval: "month" }
                    },
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits?cancelled=true`,
            metadata: {
                userId: user.id,
                planId: planId,
                credits: plan.credits
            },
            customer_email: user.email,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("[STRIPE_ERROR]", error);
        return new NextResponse(error.message, { status: 500 });
    }
}
