// 用户信息控制器

import { Elysia } from "elysia";
import { commonRes } from "@/server/utils/Res";
import { betterAuthPlugin } from "../auth/auth.plugin";

export const userRoute = new Elysia({
  prefix: "/user",
  tags: ["User"],
})

  .use(betterAuthPlugin)
  // 获取当前用户信息
  .get(
    "/me",
    async ({ userInfo, roles, permissions }) =>
      commonRes(
        {
          userInfo,
          roles,
          permissions,
        },
        200,
        "获取用户信息成功"
      ),
    {
      auth: true,
      detail: {
        summary: "获取当前用户信息",
        description: "获取当前登录用户的详细信息，包括基本信息、档案和角色",
        tags: ["User"],
      },
    }
  );
