import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ""
        );
    } catch (error: any) {
        console.error("[STRIPE_WEBHOOK_ERROR]", error.message);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    if (event.type === "checkout.session.completed") {
        const userId = session?.metadata?.userId;
        const credits = parseInt(session?.metadata?.credits || "0");
        const planId = session?.metadata?.planId;

        if (!userId || isNaN(credits)) {
            return new NextResponse("Webhook Error: Missing metadata", { status: 400 });
        }

        try {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    credits: { increment: credits },
                    subscription: planId.toUpperCase()
                }
            });
            console.log(`[STRIPE_SUCCESS] Fulfilled ${credits} credits for user ${userId}`);
        } catch (dbError) {
            console.error("[STRIPE_DB_ERROR]", dbError);
            return new NextResponse("Internal Server Error during fulfillment", { status: 500 });
        }
    }

    return new NextResponse(null, { status: 200 });
}
