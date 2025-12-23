/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { HeroCardsContract } from "@repo/contract";
import { heroCardsService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const herocardsController = new Elysia({ prefix: "/herocards" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => heroCardsService.findAll(query, { db, auth }), { query: HeroCardsContract.ListQuery })
  .post("/", ({ body, auth, db }) => heroCardsService.create(body, { db, auth }), { body: HeroCardsContract.Create })
  .delete("/:id", ({ params, auth, db }) => heroCardsService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });