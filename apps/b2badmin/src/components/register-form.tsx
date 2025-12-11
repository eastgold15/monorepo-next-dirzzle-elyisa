"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const name = formData.get("name") as string;
    const avatarFile =
      (formData.get("avatar") as File)?.size > 0
        ? (formData.get("avatar") as File)
        : undefined;

    // 验证密码匹配
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      setIsLoading(false);
      return;
    }

    try {
      // 创建注册数据
      const registerData = {
        email,
        password,
        name,
        // 如果有头像文件，需要先上传
        // avatar: avatarFile ? await uploadAvatar(avatarFile) : undefined,
      };

      // 调用注册 API - 添加 name 和 image 字段
      const enhancedRegisterData = {
        ...registerData,
        // 生成默认头像 URL
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
      };

      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(enhancedRegisterData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "注册失败，请重试");
        return;
      }

      // 注册成功，自动登录
      const loginResponse = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (loginResponse.ok) {
        // 登录成功，跳转到首页
        router.push("/dashboard");
      } else {
        // 注册成功但登录失败，跳转到登录页
        router.push("/login?message=注册成功，请登录");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("网络错误，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 创建预览
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(null);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">创建账户</CardTitle>
          <CardDescription>填写以下信息注册新账户</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <Button type="button" variant="outline">
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google(无效)
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>

              <Field>
                <FieldLabel htmlFor="name">姓名</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  placeholder="请输入您的姓名"
                  required
                  type="text"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">邮箱</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                  type="email"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="avatar">头像（可选）</FieldLabel>
                <div className="flex items-center gap-4">
                  {avatarPreview ? (
                    <img
                      alt="Avatar preview"
                      className="h-16 w-16 rounded-full object-cover"
                      src={avatarPreview}
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                      <span className="text-gray-500 text-xs">无头像</span>
                    </div>
                  )}
                  <Input
                    accept="image/*"
                    className="flex-1"
                    id="avatar"
                    name="avatar"
                    onChange={handleAvatarChange}
                    type="file"
                  />
                </div>
                <FieldDescription>
                  支持 JPG、PNG 格式，不上传将使用默认头像
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="password">密码</FieldLabel>
                <Input
                  id="password"
                  minLength={6}
                  name="password"
                  placeholder="请输入密码"
                  required
                  type="password"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">确认密码</FieldLabel>
                <Input
                  id="confirmPassword"
                  minLength={6}
                  name="confirmPassword"
                  placeholder="请再次输入密码"
                  required
                  type="password"
                />
              </Field>

              {error && (
                <FieldDescription className="text-red-500 text-sm">
                  {error}
                </FieldDescription>
              )}

              <Field>
                <Button className="w-full" disabled={isLoading} type="submit">
                  {isLoading ? "注册中..." : "注册"}
                </Button>
              </Field>

              <FieldDescription className="text-center">
                已有账户？{" "}
                <a className="text-blue-600 hover:underline" href="/login">
                  立即登录
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-gray-600 text-sm">
        注册即表示您同意我们的{" "}
        <a className="hover:underline" href="#">
          服务条款
        </a>{" "}
        和{" "}
        <a className="hover:underline" href="#">
          隐私政策
        </a>
        。
      </FieldDescription>
    </div>
  );
}
