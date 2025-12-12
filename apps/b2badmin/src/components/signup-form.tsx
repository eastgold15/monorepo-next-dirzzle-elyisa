"use client";
// import Image from "next/image";
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
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AvatarUploadNew } from "./ui/avatar-upload-new";

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
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
      };

      // 调用注册 API - 使用上传的头像或生成默认头像
      const enhancedRegisterData = {
        ...registerData,
        image:
          avatarUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
      };

      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(enhancedRegisterData),
      });

      if (!response.ok) {
        let errorData: any = null;
        try {
          const responseText = await response.text();
          console.log("Error response text:", responseText);
          if (responseText) {
            errorData = JSON.parse(responseText);
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }
        setError(errorData?.message || `注册失败 (${response.status})，请重试`);
        return;
      }

      // 注册成功，直接跳转到dashboard（Better Auth 配置了 autoSignIn）
      router.push("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      setError("网络错误，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUploadSuccess = (url: string, fileData: any) => {
    setAvatarUrl(url);
    setAvatarPreview(url);
  };

  const handleAvatarUploadError = (error: string) => {
    setError(error);
  };

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel>头像（可选）</FieldLabel>
              <div className="flex items-center gap-4">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
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
                <Button
                  onClick={() => setShowAvatarUpload(true)}
                  type="button"
                  variant="outline"
                >
                  {avatarUrl ? "更换头像" : "上传头像"}
                </Button>
              </div>
              <FieldDescription>
                点击按钮上传头像，支持 JPG、PNG 格式，不上传将使用默认头像
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input id="name" placeholder="John Doe" required type="text" />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                placeholder="m@example.com"
                required
                type="email"
              />
              <FieldDescription>
                We&apos;ll use this to contact you. We will not share your email
                with anyone else.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" required type="password" />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input id="confirm-password" required type="password" />
              <FieldDescription>Please confirm your password.</FieldDescription>
            </Field>
            {error && (
              <FieldDescription className="text-red-500 text-sm">
                {error}
              </FieldDescription>
            )}
            <Field>
              <Button className="w-full" disabled={isLoading} type="submit">
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </Field>
            <Field>
              <Button className="w-full" type="button" variant="outline">
                Sign up with Google
              </Button>
            </Field>
            <FieldDescription className="px-6 text-center">
              Already have an account? <a href="/login">Sign in</a>
            </FieldDescription>
          </FieldGroup>
        </form>

        {/* 头像上传对话框 */}
        <AvatarUploadNew
          onError={handleAvatarUploadError}
          onOpenChange={setShowAvatarUpload}
          onUploadSuccess={handleAvatarUploadSuccess}
          open={showAvatarUpload}
        />
      </CardContent>
    </Card>
  );
}
