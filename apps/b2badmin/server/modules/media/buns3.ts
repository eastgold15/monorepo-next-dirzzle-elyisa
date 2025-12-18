// import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { env } from "@/env";;

// // Create S3 client with custom endpoint (for MinIO or other S3-compatible services)
// const s3Client = new S3Client({
//   region: "us-east-1", // Default region, can be overridden
//   endpoint: env.S3_ENDPOINT,
//   forcePathStyle: true, // Important for MinIO
//   credentials: {
//     accessKeyId: env.S3_ACCESS_KEY_ID!,
//     secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
//   },
// });

// // Wrapper class to maintain compatibility
// class S3Storage {
//   private readonly client: S3Client;
//   private readonly bucket: string;

//   constructor() {
//     this.client = s3Client;
//     this.bucket = env.S3_BUCKET!;
//   }

//   async presign(
//     key: string,
//     options: {
//       method: string;
//       expiresIn: number;
//       acl?: string;
//     }
//   ): Promise<string> {
//     const command = new PutObjectCommand({
//       Bucket: this.bucket,
//       Key: key,
//       ACL: options.acl as any,
//     });

//     const presignedUrl = await getSignedUrl(this.client, command, {
//       expiresIn: options.expiresIn,
//     });

//     return presignedUrl;
//   }

//   getClient(): S3Client {
//     return this.client;
//   }
// }

// // Create and export the storage instance
// const storage = new S3Storage();

// export default storage;
