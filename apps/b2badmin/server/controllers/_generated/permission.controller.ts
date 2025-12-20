/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { PermissionContract } from "@repo/contract";
import { permissionService } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const permissionController = new Elysia({ prefix: "/permission" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => permissionService.findAll(query, { db, auth }), { query: PermissionContract.ListQuery })
  .post("/", ({ body, auth, db }) => permissionService.create(body, { db, auth }), { body: PermissionContract.Create })
  .delete("/:id", ({ params, auth, db }) => permissionService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });