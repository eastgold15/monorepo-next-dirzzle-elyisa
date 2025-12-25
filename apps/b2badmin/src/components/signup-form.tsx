"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form"; // 🔥 新增导入 FormProvider
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRegisterMutation } from "@/hooks/api/auth";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";

// 🔥 修复1：调整 zod schema，头像非必填（避免强制要求上传头像）
const formSchema = z
  .object({
    avatarId: z.string().optional(), // 头像可选，移除 min(1) 校验
    name: z.string().min(2, "姓名至少2个字符"),
    email: z.email("请输入有效的邮箱"),
    password: z.string().min(8, "密码至少8个字符"), // 统一为8位，和表单提示一致
    confirmPassword: z.string().min(8, "确认密码至少8个字符"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"], // 错误提示定位到确认密码字段
  });

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const registerMutation = useRegisterMutation();

  // 初始化表单（保持不变）
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      avatarId: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange", // 🔥 新增：实时校验
  });

  // 头像上传成功回调（🔥 修复2：同步更新表单的 avatarId）
  const handleAvatarUploadSuccess = (url: string, fileData: any) => {
    setAvatarUrl(url);
    setAvatarPreview(url);
    // 同步到表单状态
    form.setValue("avatarId", fileData.id || "");
  };

  const handleAvatarUploadError = (error: string) => {
    setError(error);
  };
  // 提交处理（优化：用 zod refine 替代手动密码校验）
  function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);

    // 创建注册数据
    const registerData = {
      email: values.email,
      password: values.password,
      name: values.name,
      image:
        avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(values.name)}&background=random&color=fff`,
    };

    // 提交注册
    registerMutation.mutate(registerData, {
      onSuccess: () => {
        router.push("/dashboard");
      },
      onError: (error: Error) => {
        setError(error.message || "注册失败，请重试");
      },
    });
  }
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 🔥 核心修复：用 FormProvider 替代原有的 Form 组件，显式传递上下文 */}
        <FormProvider {...form}>
          {/* 移除嵌套的 form 标签，直接使用原生 form + form.handleSubmit */}
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            {/* 头像上传区域 */}
            {/* <div className="space-y-2">
              <FormLabel>头像（可选）</FormLabel>
              <div className="flex items-center gap-4">
                {avatarPreview ? (
                  <div className="flex h-16 w-16 overflow-hidden">
                    <Image
                      alt="Avatar preview"
                      className="relative h-full w-full rounded-full object-cover"
                      height={40}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "https://ui-avatars.com/api/?name=User&background=random&color=fff";
                      }}
                      priority={false}
                      src={avatarPreview}
                      width={40}
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                    <span className="text-gray-500 text-xs">无头像</span>
                  </div>
                )}
                <Button
                  onClick={() => setShowAvatarUpload(true)}
                  type="button"
                  variant="outline"
                >
                  {avatarUrl ? "更换头像" : "上传头像"}
                </Button>
              </div>
              <FormDescription>
                点击按钮上传头像，支持 JPG、PNG 格式，不上传将使用默认头像
              </FormDescription>
            </div> */}

            {/* 姓名输入框（🔥 移除重复的 rules，改用 zod schema 校验） */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 邮箱输入框 */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="m@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    We&apos;ll use this to contact you. We will not share your
                    email with anyone else.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 密码输入框 */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Must be at least 8 characters long.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 确认密码输入框 */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Please confirm your password.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 全局错误提示 */}
            {error && <div className="text-red-500 text-sm">{error}</div>}

            {/* 提交按钮（🔥 增加加载状态） */}
            <Button
              className="w-full"
              disabled={
                registerMutation.isPending || form.formState.isSubmitting
              }
              type="submit"
            >
              {registerMutation.isPending
                ? "Creating Account..."
                : "Create Account"}
            </Button>

            {/* 登录链接 */}
            <div className="px-6 text-center text-gray-500 text-sm">
              Already have an account?{" "}
              <a className="text-primary" href="/login">
                Sign in
              </a>
            </div>
          </form>
        </FormProvider>

        {/* 头像上传对话框 */}
        {/* <AvatarUploadNew
          onError={handleAvatarUploadError}
          onOpenChange={setShowAvatarUpload}
          onUploadSuccess={handleAvatarUploadSuccess}
          open={showAvatarUpload}
        /> */}
      </CardContent>
    </Card>
  );
}
