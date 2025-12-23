/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { TranslationDictContract } from "@repo/contract";
import { translationDictService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const translationdictController = new Elysia({ prefix: "/translationdict" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => translationDictService.findAll(query, { db, auth }), { query: TranslationDictContract.ListQuery })
  .post("/", ({ body, auth, db }) => translationDictService.create(body, { db, auth }), { body: TranslationDictContract.Create })
  .delete("/:id", ({ params, auth, db }) => translationDictService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });