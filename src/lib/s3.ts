import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
});

export const uploadToR2 = async (buffer: Buffer, key: string, contentType: string) => {
    if (!process.env.R2_BUCKET_NAME || !process.env.R2_ENDPOINT) {
        console.warn("Cloudflare R2 configuration missing. Falling back to local skip.");
        return null;
    }

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    });

    try {
        await s3Client.send(command);
        const publicDomain = process.env.NEXT_PUBLIC_R2_DOMAIN;
        return publicDomain ? `https://${publicDomain}/${key}` : null;
    } catch (error) {
        console.error("R2 Upload Error:", error);
        return null;
    }
};
