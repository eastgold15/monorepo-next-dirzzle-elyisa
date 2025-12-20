/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
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
  .patch("/:id", ({ params, body, db, siteId }) => heroCardsService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: HeroCardsContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => heroCardsService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });