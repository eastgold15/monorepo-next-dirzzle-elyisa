/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { SkuMediaContract } from "@repo/contract";
import { skuMediaService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const skumediaController = new Elysia({ prefix: "/skumedia" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => skuMediaService.findAll(query, { db, siteId }), { query: SkuMediaContract.ListQuery })
  .post("/", ({ body, db, siteId }) => skuMediaService.create(body, { db, siteId }), { body: SkuMediaContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => skuMediaService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: SkuMediaContract.Update })
  .delete("/:id", ({ params, db, siteId }) => skuMediaService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });