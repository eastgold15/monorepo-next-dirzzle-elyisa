import { useMutation } from "@tanstack/react-query";
import { createAuthClient } from "better-auth/react";

// 注册数据的类型定义
interface RegisterData {
  email: string;
  password: string;
  name: string;
  image?: string;
  avatarId?: string;
}
//登录用戶
export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const { signUp } = createAuthClient();
      const { data: res, error } = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        image: data.image,
        callbackURL: "http://localhost:4000/dashboard",
      });
      if (error || !res) {
        return null;
      }
      return res;
    },
    onError: (error) => {
      console.error("Registration error:", error);
    },
  });
}
