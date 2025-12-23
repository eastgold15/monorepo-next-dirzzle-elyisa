/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { SkusContract } from "@repo/contract";
import { skusService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const skusController = new Elysia({ prefix: "/skus" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => skusService.findAll(query, { db, siteId }), { query: SkusContract.ListQuery })
  .post("/", ({ body, db, siteId }) => skusService.create(body, { db, siteId }), { body: SkusContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => skusService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: SkusContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => skusService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });