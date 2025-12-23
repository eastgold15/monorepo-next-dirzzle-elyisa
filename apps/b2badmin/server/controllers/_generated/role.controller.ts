/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { RoleContract } from "@repo/contract";
import { roleService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const roleController = new Elysia({ prefix: "/role" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => roleService.findAll(query, { db, auth }), { query: RoleContract.ListQuery })
  .post("/", ({ body, auth, db }) => roleService.create(body, { db, auth }), { body: RoleContract.Create })
  .delete("/:id", ({ params, auth, db }) => roleService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });