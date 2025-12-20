/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { HeroCardsContract } from "@repo/contract";
import { heroCardsService } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const herocardsController = new Elysia({ prefix: "/herocards" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => heroCardsService.findAll(query, { db, auth }), { query: HeroCardsContract.ListQuery })
  .post("/", ({ body, auth, db }) => heroCardsService.create(body, { db, auth }), { body: HeroCardsContract.Create })
  .delete("/:id", ({ params, auth, db }) => heroCardsService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });