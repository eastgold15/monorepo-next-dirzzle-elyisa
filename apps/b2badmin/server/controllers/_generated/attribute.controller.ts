/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { AttributeContract } from "@repo/contract";
import { attributeService } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const attributeController = new Elysia({ prefix: "/attribute" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => attributeService.findAll(query, { db, auth }), { query: AttributeContract.ListQuery })
  .post("/", ({ body, auth, db }) => attributeService.create(body, { db, auth }), { body: AttributeContract.Create })
  .delete("/:id", ({ params, auth, db }) => attributeService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });