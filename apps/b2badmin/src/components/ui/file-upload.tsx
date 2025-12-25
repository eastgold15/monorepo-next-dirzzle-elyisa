// "use client";

// import { Upload as UploadIcon, X } from "lucide-react";
// import Image from "next/image";
// import * as React from "react";

// import { cn } from "@/lib/utils";
// import { Button } from "./button";
// import { Card, CardContent } from "./card";

// // 仅存储文件展示信息（不存文件本体）
// interface FileDisplayInfo {
//   id: string;
//   name: string;
//   size: number;
//   preview: string;
//   progress: number;
//   status: "pending" | "success" | "error";
//   error?: string;
// }

// interface SimpleMultiFileUploadProps {
//   config: Pick<
//     UploadTModel["UploadConfig"],
//     "accept" | "maxSize" | "category" | "multiple"
//   >;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onUploadSuccess?: (files: Array<{ url: string; data: any }>) => void;
//   onError?: (error: string) => void;
// }

// export function SimpleMultiFileUpload({
//   config,
//   open,
//   onOpenChange,
//   onUploadSuccess,
//   onError,
// }: SimpleMultiFileUploadProps) {
//   const [isUploading, setIsUploading] = React.useState(false);
//   const [uploadFiles, setUploadFiles] = React.useState<FileDisplayInfo[]>([]); // 仅存展示信息
//   const fileInputRef = React.useRef<HTMLInputElement>(null);
//   const uploadMutation = useDirectUploadMutation();

//   // 格式化文件大小
//   const formatFileSize = (bytes: number) => {
//     if (bytes < 1024) return `${bytes} B`;
//     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
//     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
//   };

//   // 校验文件
//   const validateFile = (file: File): string | null => {
//     if (
//       config.accept &&
//       !config.accept
//         .split(",")
//         .map((t) => t.trim())
//         .includes(file.type)
//     ) {
//       return `仅支持 ${config.accept} 格式`;
//     }
//     if (config.maxSize && file.size > config.maxSize) {
//       return `文件最大支持 ${formatFileSize(config.maxSize)}`;
//     }
//     return null;
//   };

//   // 生成预览（使用后释放URL）
//   const createPreview = (file: File) => {
//     if (file.type.startsWith("image/")) {
//       return URL.createObjectURL(file);
//     }
//     return "";
//   };

//   // 移除文件（同时释放预览URL）
//   const removeFile = (id: string) => {
//     setUploadFiles((prev) => {
//       const file = prev.find((f) => f.id === id);
//       if (file?.preview) URL.revokeObjectURL(file.preview); // 释放内存
//       return prev.filter((f) => f.id !== id);
//     });
//   };

//   // 处理文件选择（仅存展示信息，不存文件本体）
//   const handleFileSelect = (files: FileList | null) => {
//     if (!files || files.length === 0) return;

//     const newFileInfos: FileDisplayInfo[] = [];
//     Array.from(files).forEach((file) => {
//       const error = validateFile(file);
//       if (error) {
//         onError?.(error);
//         return;
//       }

//       newFileInfos.push({
//         id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
//         name: file.name,
//         size: file.size,
//         preview: createPreview(file),
//         progress: 0,
//         status: "pending",
//       });
//     });

//     setUploadFiles((prev) => [...prev, ...newFileInfos]);
//   };

//   // 上传文件（直接从input取文件，不存状态）
//   const uploadFilesHandler = async () => {
//     if (!fileInputRef.current?.files || fileInputRef.current.files.length === 0)
//       return;

//     setIsUploading(true);
//     const uploadedResults: Array<{ url: string; data: any }> = [];
//     const files = Array.from(fileInputRef.current.files);

//     // 匹配展示信息和实际文件（通过名称+大小）
//     // biome-ignore lint/style/useForOf: <explanation>
//     for (let i = 0; i < files.length; i++) {
//       const file = files[i];
//       const fileInfo = uploadFiles.find(
//         (f) => f.name === file.name && f.size === file.size
//       );
//       if (!fileInfo) continue;

//       // 更新进度
//       setUploadFiles((prev) =>
//         prev.map((f) =>
//           f.id === fileInfo.id
//             ? { ...f, status: "uploading" as any, progress: 30 }
//             : f
//         )
//       );

//       try {
//         const uploadResult = await uploadMutation.mutateAsync({
//           file,
//           category: config.category,
//           userId: undefined,
//         });

//         // 更新成功状态
//         setUploadFiles((prev) =>
//           prev.map((f) =>
//             f.id === fileInfo.id
//               ? { ...f, status: "success", progress: 100 }
//               : f
//           )
//         );
//         uploadedResults.push({
//           url: uploadResult.data ? uploadResult.data.url : "",
//           data: uploadResult,
//         });
//       } catch (error) {
//         const errorMsg = error instanceof Error ? error.message : "上传失败";
//         // 更新失败状态
//         setUploadFiles((prev) =>
//           prev.map((f) =>
//             f.id === fileInfo.id
//               ? { ...f, status: "error", error: errorMsg }
//               : f
//           )
//         );
//         onError?.(errorMsg);
//       }
//     }

//     // 上传完成回调
//     if (uploadedResults.length > 0) {
//       onUploadSuccess?.(uploadedResults);
//     }

//     // 清理资源
//     setTimeout(() => {
//       onOpenChange(false);
//       // 释放所有预览URL
//       uploadFiles.forEach((f) => {
//         if (f.preview) URL.revokeObjectURL(f.preview);
//       });
//       setUploadFiles([]);
//       // 清空input
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     }, 1000);

//     setIsUploading(false);
//   };

//   // 拖拽处理
//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     handleFileSelect(e.dataTransfer.files);
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       {/* 背景遮罩 */}
//       <div
//         className="absolute inset-0 bg-black/50"
//         onClick={() => onOpenChange(false)}
//       />

//       {/* 上传弹窗 */}
//       <Card className="relative z-10 mx-4 w-full max-w-md">
//         <CardContent className="p-6">
//           {/* 标题和关闭按钮 */}
//           <div className="mb-4 flex items-center justify-between">
//             <h3 className="font-semibold text-lg">上传文件</h3>
//             <Button
//               onClick={() => onOpenChange(false)}
//               size="icon"
//               variant="ghost"
//             >
//               <X className="h-4 w-4" />
//             </Button>
//           </div>

//           {/* 上传区域 */}
//           <div
//             className={cn(
//               "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center",
//               "transition-colors hover:border-primary"
//             )}
//             onClick={() => fileInputRef.current?.click()}
//             onDragOver={(e) => e.preventDefault()}
//             onDrop={handleDrop}
//           >
//             <UploadIcon className="mx-auto h-10 w-10 text-gray-400" />
//             <p className="mt-2 text-gray-600">点击或拖拽文件到此处上传</p>
//             <p className="mt-1 text-gray-500 text-sm">
//               {config.maxSize && `最大：${formatFileSize(config.maxSize)}`}
//               {config.accept && ` • 格式：${config.accept}`}
//             </p>
//           </div>

//           {/* 隐藏的文件选择框 */}
//           <input
//             accept={config.accept}
//             className="hidden"
//             multiple={config.multiple}
//             onChange={(e) => handleFileSelect(e.target.files)}
//             ref={fileInputRef}
//             type="file"
//           />

//           {/* 已选择文件列表（仅展示） */}
//           {uploadFiles.length > 0 && (
//             <div className="mt-4 space-y-2">
//               <p className="font-medium text-gray-700 text-sm">
//                 待上传文件 ({uploadFiles.length})
//               </p>
//               {uploadFiles.map((file) => (
//                 <div
//                   className="flex items-center gap-3 rounded-lg border p-2"
//                   key={file.id}
//                 >
//                   {file.preview && (
//                     <Image
//                       alt={file.name}
//                       className="h-12 w-12 rounded object-cover"
//                       height={48}
//                       src={file.preview}
//                       width={48}
//                     />
//                   )}
//                   <div className="flex-1">
//                     <p className="truncate font-medium text-sm">{file.name}</p>
//                     <p className="text-gray-500 text-xs">
//                       {formatFileSize(file.size)}
//                     </p>
//                     {/* {file.status === "pending" && (
//                       <Progress
//                         className="mt-1 h-1 w-full"
//                         value={file.progress}
//                       />
//                     )} */}
//                     {file.status === "error" && (
//                       <p className="mt-1 text-red-500 text-xs">{file.error}</p>
//                     )}
//                   </div>
//                   {file.status === "pending" && (
//                     <Button
//                       onClick={() => removeFile(file.id)}
//                       size="icon"
//                       variant="ghost"
//                     >
//                       <X className="h-3 w-3" />
//                     </Button>
//                   )}
//                   {file.status === "success" && (
//                     <span className="text-green-600 text-xs">✓</span>
//                   )}
//                   {file.status === "error" && (
//                     <span className="text-red-600 text-xs">✗</span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* 操作按钮 */}
//           <div className="mt-6 flex justify-end gap-2">
//             <Button
//               disabled={isUploading}
//               onClick={() => {
//                 // 取消时释放所有预览URL
//                 uploadFiles.forEach((f) => {
//                   if (f.preview) URL.revokeObjectURL(f.preview);
//                 });
//                 setUploadFiles([]);
//                 if (fileInputRef.current) fileInputRef.current.value = "";
//                 onOpenChange(false);
//               }}
//               variant="outline"
//             >
//               取消
//             </Button>
//             <Button
//               disabled={uploadFiles.length === 0 || isUploading}
//               onClick={uploadFilesHandler}
//             >
//               {isUploading ? "上传中..." : `上传 (${uploadFiles.length})`}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
