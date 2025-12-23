/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { AttributeValueContract } from "@repo/contract";
import { attributeValueService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const attributevalueController = new Elysia({ prefix: "/attributevalue" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => attributeValueService.findAll(query, { db, siteId }), { query: AttributeValueContract.ListQuery })
  .post("/", ({ body, db, siteId }) => attributeValueService.create(body, { db, siteId }), { body: AttributeValueContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => attributeValueService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: AttributeValueContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => attributeValueService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });