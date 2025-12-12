"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // 调用登录 API
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          setError(errorData.message || "登录失败，请检查邮箱和密码");
        } catch {
          setError("登录失败，请检查邮箱和密码");
        }
        return;
      }

      // 登录成功，跳转到dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("网络错误，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">欢迎回来</CardTitle>
          <CardDescription>使用您的邮箱和密码登录账户</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-green-700 text-sm">
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <FieldGroup>
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
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">密码</FieldLabel>
                  <a
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                    href="/forgot-password"
                  >
                    忘记密码？
                  </a>
                </div>
                <Input id="password" name="password" required type="password" />
              </Field>

              {error && (
                <FieldDescription className="text-red-500 text-sm">
                  {error}
                </FieldDescription>
              )}

              <Field>
                <Button className="w-full" disabled={isLoading} type="submit">
                  {isLoading ? "登录中..." : "登录"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                还没有账户？{" "}
                <a className="text-blue-600 hover:underline" href="/signup">
                  立即注册
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        登录即表示您同意我们的{" "}
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
