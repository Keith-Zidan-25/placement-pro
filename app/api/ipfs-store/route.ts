import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';
import { Readable } from 'stream';

export const config = {
    api: {
        bodyParser: false,
    },
};

const s3 = new AWS.S3({
    endpoint: 'https://s3.filebase.com',
    accessKeyId: process.env.FILEBASE_ACCESS_KEY!,
    secretAccessKey: process.env.FILEBASE_SECRET_KEY!,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
});

function streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        const file = data.get("file") as File;

        if (!file) {
            return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = file.name;

        const uploadParams = {
            Bucket: process.env.BUCKET_NAME!,
            Key: fileName,
            Body: buffer,
            ContentType: file.type,
        };

        const uploadResult = await s3.upload(uploadParams).promise();

        await new Promise((r) => setTimeout(r, 100));
        const headResult = await s3.headObject({
            Bucket: process.env.BUCKET_NAME!,
            Key: fileName,
        }).promise();

        const cid =
            headResult.Metadata?.cid ||
            headResult.Metadata?.['ipfs-hash'] ||
            headResult.Metadata?.['x-amz-meta-cid'] ||
            headResult.Metadata?.['x-amz-meta-ipfs-hash'];

        return NextResponse.json({
            success: true,
            fileName,
            location: uploadResult.Location,
            cid: cid || null,
        });
    } catch (error) {
        console.error("Image upload failed:", error);
        return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
    }
}
