/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { AttributeTemplateContract } from "@repo/contract";
import { attributeTemplateService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const attributetemplateController = new Elysia({ prefix: "/attributetemplate" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => attributeTemplateService.findAll(query, { db, siteId }), { query: AttributeTemplateContract.ListQuery })
  .post("/", ({ body, db, siteId }) => attributeTemplateService.create(body, { db, siteId }), { body: AttributeTemplateContract.Create })
  .put("/:id", ({ params, body, db, siteId }) => attributeTemplateService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: AttributeTemplateContract.Update })
  .delete("/:id", ({ params, db, siteId }) => attributeTemplateService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });