import { S3Client } from "bun";
import { envConfig } from "@/lib/env/server";

const minio = new S3Client({
  accessKeyId: envConfig.S3_ACCESS_KEY_ID,
  secretAccessKey: envConfig.S3_SECRET_ACCESS_KEY,
  bucket: envConfig.S3_BUCKET,

  // Make sure to use the correct endpoint URL
  // It might not be localhost in production!
  endpoint: envConfig.S3_ENDPOINT,
});

export default minio;
