// s3.test.ts
import { describe, expect, test } from "bun:test"; // 👈 使用 Bun Test API
import { S3Client } from "bun";

const minio = new S3Client({
  accessKeyId: "minioadmin",
  secretAccessKey: "minioadmin",
  bucket: "buy4",
  endpoint: "http://localhost:9010",
  // 推荐加上 forcePathStyle: true
  // @ts-expect-error MinIO 需要这个参数，但 S3Client 类型可能没有
  forcePathStyle: true,
});

describe("MinIO S3 Integration", () => {
  test("should successfully write a file to S3/MinIO", async () => {
    // 检查本地文件是否存在

    const testJsonPath = Bun.fileURLToPath(
      new URL("./test.json", import.meta.url)
    );
    console.log("testJsonPath:", testJsonPath);

    const localFile = Bun.file(testJsonPath);

    // 可选：先检查文件是否存在
    if (!(await localFile.exists())) {
      throw new Error(`Test file not found at ${testJsonPath}`);
    }

    console.log("localFile:", localFile);

    const fileContent = await localFile.json();
    console.log("fileContent:", fileContent);
    const objectKey = `test/favicon-${Date.now()}.ico`; // 使用唯一 Key

    // 使用 Bun.S3 推荐的 file().write() 方法
    const s3file = minio.file(objectKey);

    // 写入文件
    const writeResult = await s3file.write(fileContent, {
      type: localFile.type,
    });
    console.log("writeResult:", writeResult);

    // 检查写入是否成功 (Bun.S3.write 成功不会抛出异常)
    expect(writeResult).toBeUndefined(); // write() 返回 Promise<void>

    // 可选：检查文件是否存在于 MinIO 中
    const exists = await s3file.exists();
    expect(exists).toBe(true);

    // 清理：删除测试文件
    await s3file.remove();
    const deletedExists = await s3file.exists();
    expect(deletedExists).toBe(false);
  }, 10_000); // 增加超时时间以防网络慢
});
