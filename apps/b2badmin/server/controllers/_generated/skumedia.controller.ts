/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { SkuMediaContract } from "@repo/contract";
import { skuMediaService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const skumediaController = new Elysia({ prefix: "/skumedia" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => skuMediaService.findAll(query, { db, auth }), { query: SkuMediaContract.ListQuery })
  .post("/", ({ body, auth, db }) => skuMediaService.create(body, { db, auth }), { body: SkuMediaContract.Create })
  .delete("/:id", ({ params, auth, db }) => skuMediaService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });