"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

// 定义表单验证 Schema
const loginFormSchema = z.object({
  email: z.string().email({ message: "请输入有效的邮箱地址" }),
  password: z.string().min(1, { message: "密码不能为空" }),
});

// 推导表单值类型
type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  // 初始化 react-hook-form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 处理表单提交
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);

    try {
      // 调用登录 API

      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (!data) {
        return null;
      }

      // 登录成功，跳转到dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      form.setError("root", { message: "网络错误，请稍后重试" });
    } finally {
      setIsLoading(false);
    }
  };

  // 处理邮箱变化（重置密码和错误）
  const handleEmailChange = (value: string) => {
    // 更新邮箱值
    form.setValue("email", value);
    // 重置密码
    form.setValue("password", "");
    // 清除所有错误
    form.clearErrors();
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4">
                {/* 邮箱字段 */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="email">邮箱</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          placeholder="m@example.com"
                          type="email"
                          {...field}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 密码字段 */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel htmlFor="password">密码</FormLabel>
                        <a
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                          href="/forgot-password"
                        >
                          忘记密码？
                        </a>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            {...field}
                            required
                          />
                          <Button
                            className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 全局错误提示 - 替换为普通 div */}
                {form.formState.errors.root && (
                  <div className="text-red-500 text-sm">
                    {form.formState.errors.root.message}
                  </div>
                )}

                {/* 登录按钮 */}
                <div>
                  <Button
                    className="w-full"
                    disabled={isLoading || !form.formState.isValid}
                    type="submit"
                  >
                    {isLoading ? "登录中..." : "登录"}
                  </Button>
                </div>

                {/* 注册引导 - 替换为普通 div */}
                <div className="text-center text-muted-foreground text-sm">
                  还没有账户？{" "}
                  <a className="text-blue-600 hover:underline" href="/signup">
                    立即注册
                  </a>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* 服务条款 - 替换为普通 div */}
      <div className="px-6 text-center text-muted-foreground text-sm">
        登录即表示您同意我们的{" "}
        <a className="hover:underline" href="#">
          服务条款
        </a>{" "}
        和{" "}
        <a className="hover:underline" href="#">
          隐私政策
        </a>
        。
      </div>
    </div>
  );
}
