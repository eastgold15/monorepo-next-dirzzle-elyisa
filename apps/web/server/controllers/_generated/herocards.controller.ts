/**
 * 🤖 【Web Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { HeroCardsContract } from "@repo/contract";
import { heroCardsService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { siteMiddleware } from "~/middleware/site";

export const herocardsController = new Elysia({ prefix: "/herocards" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => heroCardsService.findAll(query, { db, siteId }), { query: HeroCardsContract.ListQuery })
  .post("/", ({ body, db, siteId }) => heroCardsService.create(body, { db, siteId }), { body: HeroCardsContract.Create })
  .put("/:id", ({ params, body, db, siteId }) => heroCardsService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: HeroCardsContract.Update })
  .delete("/:id", ({ params, db, siteId }) => heroCardsService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });