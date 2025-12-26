/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { FactoriesContract } from "@repo/contract";
import { factoriesService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const factoriesController = new Elysia({ prefix: "/factories" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => factoriesService.findAll(query, { db, siteId }), { query: FactoriesContract.ListQuery })
  .post("/", ({ body, db, siteId }) => factoriesService.create(body, { db, siteId }), { body: FactoriesContract.Create })
  .put("/:id", ({ params, body, db, siteId }) => factoriesService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: FactoriesContract.Update })
  .delete("/:id", ({ params, db, siteId }) => factoriesService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });