/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
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
  .put("/:id", ({ params, body, db, siteId }) => translationDictService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: TranslationDictContract.Update })
  .delete("/:id", ({ params, db, siteId }) => translationDictService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });