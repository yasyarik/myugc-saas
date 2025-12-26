import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";

// Helper to resize buffers
async function resizeImageBuffer(buffer: Buffer, maxWidth = 1080, maxHeight = 1920, fit: 'contain' | 'cover' | 'fill' | 'inside' | 'outside' = 'cover') {
    try {
        const metadata = await sharp(buffer).metadata();
        // console.log(`Original image - Size: ${metadata.width}x${metadata.height}, Format: ${metadata.format}`);

        let format = metadata.format;
        if (format === 'jpg') format = 'jpeg';

        let pipeline = sharp(buffer, {
            failOnError: false
        })
            .resize({
                width: maxWidth,
                height: maxHeight,
                fit: fit,
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            });

        if (format === 'png') {
            pipeline = pipeline.png();
        } else {
            pipeline = pipeline.toColorspace('srgb').jpeg();
        }

        const resizedBuffer = await pipeline.toBuffer();
        return resizedBuffer;
    } catch (error) {
        console.error("Failed to resize image:", error);
        return buffer;
    }
}

async function fetchImageAsBase64(url: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Normalize product to 9:16 using 'cover' mode
    const normalizedBuffer = await resizeImageBuffer(buffer, 1080, 1920, 'cover');
    return normalizedBuffer.toString('base64');
}

interface GenerateOptions {
    productImageUrl?: string;
    productImageBuffer?: Buffer;
    modelImageBuffer?: Buffer | null;
    locationImageBuffer?: Buffer | null;
    promptText?: string;
}

export async function generateTryOnImage({
    productImageUrl,
    productImageBuffer,
    modelImageBuffer,
    locationImageBuffer,
    promptText
}: GenerateOptions) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("GOOGLE_API_KEY is missing!");
        throw new Error("API Key configuration error");
    }

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const modelName = "gemini-2.5-flash-image";

        // 1. Prepare Product Base64
        let productBase64: string;
        if (productImageBuffer) {
            const resized = await resizeImageBuffer(productImageBuffer, 1080, 1920, 'cover');
            productBase64 = resized.toString('base64');
        } else if (productImageUrl) {
            productBase64 = await fetchImageAsBase64(productImageUrl);
        } else {
            throw new Error("No product image provided");
        }

        const prompt: any[] = [];

        // 2. Add Model (if exists)
        if (modelImageBuffer) {
            const resizedModel = await resizeImageBuffer(modelImageBuffer, 1080, 1920, 'cover');
            const modelMeta = await sharp(resizedModel).metadata();
            const mime = modelMeta.format === 'png' ? 'image/png' : 'image/jpeg';

            prompt.push({
                inlineData: {
                    data: resizedModel.toString('base64'),
                    mimeType: mime,
                },
            });
        }

        // 3. Add Product
        prompt.push({
            inlineData: {
                data: productBase64,
                mimeType: "image/jpeg",
            },
        });

        // 4. Add Location (if exists)
        if (locationImageBuffer) {
            const resizedLoc = await resizeImageBuffer(locationImageBuffer, 1080, 1920, 'cover');
            const locMeta = await sharp(resizedLoc).metadata();
            const mime = locMeta.format === 'png' ? 'image/png' : 'image/jpeg';

            prompt.push({
                inlineData: {
                    data: resizedLoc.toString('base64'),
                    mimeType: mime,
                },
            });
        }

        // 5. Add Text
        prompt.push({ text: promptText || "Create a professional product photo." });

        // 6. Generate
        console.log("Creating generation with model:", modelName);
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            generationConfig: {
                aspectRatio: "9:16",
            } as any, // Cast to any because TS defs might be slightly different
        });

        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) throw new Error("No candidates returned");

        const candidate = candidates[0];
        // @ts-ignore
        if (candidate.finishReason && candidate.finishReason !== "STOP") {
            // @ts-ignore
            throw new Error(`Generation blocked: ${candidate.finishReason}`);
        }

        if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    const base64Image = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType || "image/png";
                    return `data:${mimeType};base64,${base64Image}`;
                }
            }
        }

        throw new Error("No image data in response");

    } catch (error: any) {
        console.error("Gemini Generation Error:", error);
        throw new Error(`Generation failed: ${error.message}`);
    }
}

export async function generateImageFromPrompt(promptText: string): Promise<string> {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error("API Key configuration error");

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const modelName = "gemini-2.5-flash-image";

        const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ text: promptText }],
            generationConfig: {
                aspectRatio: "9:16",
            } as any,
        });

        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) throw new Error("No candidates returned");

        const candidate = candidates[0];
        if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    const base64Image = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType || "image/png";
                    return `data:${mimeType};base64,${base64Image}`;
                }
            }
        }
        throw new Error("No image data in response");

    } catch (error: any) {
        console.error("Gemini Prompt Generation Error:", error);
        throw new Error(`Generation failed: ${error.message}`);
    }
}
