// import { NextResponse } from "next/server";
// import path from "path";
// import fs from "fs/promises";

// export const POST = async (req: Request) => {
//   const formData = await req.formData();
//   const file = formData.get("file") as File;

//   if (!file) {
//     return NextResponse.json({ error: "No file provided" }, { status: 400 });
//   }

//   const uploadDir = path.join(process.cwd(), "public/uploads");
//   await fs.mkdir(uploadDir, { recursive: true });

//   const filePath = path.join(uploadDir, file.name);
//   const buffer = Buffer.from(await file.arrayBuffer());
//   await fs.writeFile(filePath, buffer);

//   return NextResponse.json({ url: `/uploads/${file.name}` });
// };


import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  endpoint: process.env.MINIO_PUBLIC_URL, // MinIO endpoint
  region: 'us-east-1',
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File not provided' }, { status: 400 });
    }

    const bucketName = 'cockpit-crc';
    const key = `${Date.now()}-${file.name}`;

    const arrayBuffer = await file.arrayBuffer();

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: Buffer.from(arrayBuffer),
      ContentType: file.type,
    });

    await s3.send(command);

    const fileUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${key}`;
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}