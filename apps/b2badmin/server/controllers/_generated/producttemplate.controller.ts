/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { ProductTemplateContract } from "@repo/contract";
import { productTemplateService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const producttemplateController = new Elysia({ prefix: "/producttemplate" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => productTemplateService.findAll(query, { db, auth }), { query: ProductTemplateContract.ListQuery })
  .post("/", ({ body, auth, db }) => productTemplateService.create(body, { db, auth }), { body: ProductTemplateContract.Create })
  .delete("/:id", ({ params, auth, db }) => productTemplateService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });