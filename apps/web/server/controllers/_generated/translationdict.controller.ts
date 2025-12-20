/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { TranslationDictContract } from "@repo/contract";
import { translationDictService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const translationdictController = new Elysia({ prefix: "/translationdict" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => translationDictService.findAll(query, { db, siteId }), { query: TranslationDictContract.ListQuery })
  .post("/", ({ body, db, siteId }) => translationDictService.create(body, { db, siteId }), { body: TranslationDictContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => translationDictService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: TranslationDictContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => translationDictService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });