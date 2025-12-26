/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { AdsContract } from "@repo/contract";
import { adsService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const adsController = new Elysia({ prefix: "/ads" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => adsService.findAll(query, { db, siteId }), { query: AdsContract.ListQuery })
  .post("/", ({ body, db, siteId }) => adsService.create(body, { db, siteId }), { body: AdsContract.Create })
  .put("/:id", ({ params, body, db, siteId }) => adsService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: AdsContract.Update })
  .delete("/:id", ({ params, db, siteId }) => adsService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });