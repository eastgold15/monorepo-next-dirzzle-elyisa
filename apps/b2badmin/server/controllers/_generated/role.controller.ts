/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { RoleContract } from "@repo/contract";
import { roleService } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const roleController = new Elysia({ prefix: "/role" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => roleService.findAll(query, { db, auth }), { query: RoleContract.ListQuery })
  .post("/", ({ body, auth, db }) => roleService.create(body, { db, auth }), { body: RoleContract.Create })
  .delete("/:id", ({ params, auth, db }) => roleService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });