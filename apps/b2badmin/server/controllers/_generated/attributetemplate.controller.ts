/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { AttributeTemplateContract } from "@repo/contract";
import { attributeTemplateService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const attributetemplateController = new Elysia({ prefix: "/attributetemplate" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => attributeTemplateService.findAll(query, { db, auth }), { query: AttributeTemplateContract.ListQuery })
  .post("/", ({ body, auth, db }) => attributeTemplateService.create(body, { db, auth }), { body: AttributeTemplateContract.Create })
  .delete("/:id", ({ params, auth, db }) => attributeTemplateService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });