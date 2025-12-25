"use client";

interface AvatarUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess: (url: string, data: any) => void;
  onError?: (error: string) => void;
}

// 头像上传配置
const avatarUploadConfig = {
  category: "avatar", // 头像分类
  mediaType: "image", // 媒体类型为图片
  multiple: false, // 不允许多文件
  maxSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 1,
  accept: "image/jpeg,image/png,image/gif,image/webp", // 支持的图片格式
};

export function AvatarUploadNew({
  open,
  onOpenChange,
  onUploadSuccess,
  onError,
}: AvatarUploadProps) {
  const handleUploadSuccess = (files: Array<{ url: string; data: any }>) => {
    // 头像上传只会返回一个文件
    if (files.length > 0) {
      onUploadSuccess(files[0].url, files[0].data);
    }
  };

  return (
    <>
      {" "}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
        1
      </div>
    </>
    // <SimpleMultiFileUpload
    //   config={avatarUploadConfig}
    //   onError={onError}
    //   onOpenChange={onOpenChange}
    //   onUploadSuccess={handleUploadSuccess}
    //   open={open}
    // />
  );
}
