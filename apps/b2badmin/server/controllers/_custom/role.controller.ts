/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { RoleContract } from "@repo/contract";
import { Elysia } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { roleService } from "../../modules/index";

export const roleController = new Elysia({ prefix: "/role" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => roleService.list({ db, auth }, query), {
    query: RoleContract.ListQuery,
    detail: {
      tags: ["角色"],
      summary: "查询角色列表",
    },
  });
