import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
  forcePathStyle: true,
});

async function upload() {
  const fileContent = fs.readFileSync("image.png");

  const command = new PutObjectCommand({
    Bucket: "fag",
    Key: "image.png",
    Body: fileContent,
    ContentType: "image.png",
  });

  await s3.send(command);
  console.log("Arquivo enviado com sucesso 🚀");
}

upload();