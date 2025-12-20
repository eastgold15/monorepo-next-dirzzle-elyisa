/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { SkuMediaContract } from "@repo/contract";
import { skuMediaService } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const skumediaController = new Elysia({ prefix: "/skumedia" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => skuMediaService.findAll(query, { db, auth }), { query: SkuMediaContract.ListQuery })
  .post("/", ({ body, auth, db }) => skuMediaService.create(body, { db, auth }), { body: SkuMediaContract.Create })
  .delete("/:id", ({ params, auth, db }) => skuMediaService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });