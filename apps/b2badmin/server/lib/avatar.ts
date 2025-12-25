import { createHash } from "node:crypto";

/**
 * 生成默认头像URL（使用 UI Avatars 服务）
 * @param name 用户名
 * @param size 头像大小
 * @returns 头像URL
 */
export function generateDefaultAvatar(name: string, size = 128): string {
  // 清理姓名，只保留字母和数字
  const cleanName = name.replace(/[^a-zA-Z0-9\s]/g, "").trim();

  // 生成颜色（基于姓名的哈希值）
  const hash = createHash("md5").update(name).digest("hex");
  const colors = [
    "FF6B6B",
    "4ECDC4",
    "45B7D1",
    "96CEB4",
    "FFEAA7",
    "DDA0DD",
    "98D8C8",
    "F7DC6F",
    "BB8FCE",
    "85C1E2",
  ];
  const colorIndex = Number.parseInt(hash.substring(0, 8), 16) % colors.length;
  const backgroundColor = colors[colorIndex];

  // 使用 UI Avatars 服务生成头像
  const params = new URLSearchParams({
    name: cleanName,
    size: size.toString(),
    background: backgroundColor,
    color: "fff",
    bold: "true",
    format: "svg",
  });

  return `https://ui-avatars.com/api/?${params.toString()}`;
}

/**
 * 处理头像上传或生成默认头像
 * @param file 上传的文件（可选）
 * @param name 用户名
 * @returns 头像URL
 */
export function handleAvatarUpload(
  file?: File,
  name?: string
): Promise<string> {
  if (file?.type.startsWith("image/")) {
    // TODO: 实现文件上传逻辑（阿里云OSS或本地存储）
    // 目前暂时返回默认头像
    console.log("Avatar upload not implemented yet, using default avatar");
  }

  // 如果没有上传文件或上传失败，使用默认头像
  if (name) {
    return Promise.resolve(generateDefaultAvatar(name));
  }

  // 如果连姓名都没有，使用默认头像
  return Promise.resolve(generateDefaultAvatar("User"));
}
