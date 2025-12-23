/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { Elysia, t } from "elysia";
import { SiteConfigContract } from "@repo/contract";
import { siteConfigService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";

import { authGuardMid } from "~/middleware/auth";

export const siteconfigController = new Elysia({ prefix: "/siteconfig" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => siteConfigService.findAll(query, { db, auth }), { query: SiteConfigContract.ListQuery })
  .post("/", ({ body, auth, db }) => siteConfigService.create(body, { db, auth }), { body: SiteConfigContract.Create })
  .delete("/:id", ({ params, auth, db }) => siteConfigService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });