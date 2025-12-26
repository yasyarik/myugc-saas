import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";
import { aiService } from "@/lib/ai";
import { uploadToR2 } from "@/lib/s3";
import path from "path";
import fs from "fs/promises";

export async function POST(req: Request) {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const formData = await req.formData();
        const action = formData.get("action");

        // Find the user in our DB
        const user = await prisma.user.findUnique({
            where: { clerkId }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (action === "generate") {
            const productImageUrl = formData.get("productImage") as string;
            const modelImage = formData.get("modelImage") as File;
            const prompt = formData.get("prompt") as string;

            if (user.credits < 1) {
                return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
            }

            // 1. Process model image to Buffer
            const arrayBuffer = await modelImage.arrayBuffer();
            const modelBuffer = Buffer.from(arrayBuffer);

            // 2. Call AI service (shared production logic)
            const generatedImageUrl = await aiService.generateTryOnImage(
                productImageUrl,
                modelBuffer,
                prompt
            );

            if (!generatedImageUrl) {
                throw new Error("Failed to generate image");
            }

            // 3. Save to Cloudflare R2 (fallback to local if R2 not configured)
            const fileName = `gen-${user.id}-${Date.now()}.jpg`;
            const base64Data = generatedImageUrl.split(",")[1];
            const buffer = Buffer.from(base64Data, "base64");

            let imageUrl = await uploadToR2(buffer, `generations/${fileName}`, "image/jpeg");

            if (!imageUrl) {
                console.warn("R2 Upload failed, falling back to local storage");
                const publicPath = path.join(process.cwd(), "public", "generations");
                await fs.mkdir(publicPath, { recursive: true });
                await fs.writeFile(path.join(publicPath, fileName), buffer);
                imageUrl = `/generations/${fileName}`;
            }

            // 4. Update user credits and save record
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: user.id },
                    data: { credits: { decrement: 1 } }
                }),
                prisma.generatedImage.create({
                    data: {
                        userId: user.id,
                        imageUrl: imageUrl,
                        productTitle: formData.get("productTitle") as string || "Custom Product"
                    }
                })
            ]);

            return NextResponse.json({ url: imageUrl, credits: user.credits - 1 });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        console.error("[GENERATE_ERROR]", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
