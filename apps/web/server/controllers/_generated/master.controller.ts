/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { MasterContract } from "@repo/contract";
import { masterService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const masterController = new Elysia({ prefix: "/master" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => masterService.findAll(query, { db, siteId }), { query: MasterContract.ListQuery })
  .post("/", ({ body, db, siteId }) => masterService.create(body, { db, siteId }), { body: MasterContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => masterService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: MasterContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => masterService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });