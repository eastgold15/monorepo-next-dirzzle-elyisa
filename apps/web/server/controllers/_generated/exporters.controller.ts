/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { ExportersContract } from "@repo/contract";
import { exportersService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const exportersController = new Elysia({ prefix: "/exporters" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => exportersService.findAll(query, { db, siteId }), { query: ExportersContract.ListQuery })
  .post("/", ({ body, db, siteId }) => exportersService.create(body, { db, siteId }), { body: ExportersContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => exportersService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: ExportersContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => exportersService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });