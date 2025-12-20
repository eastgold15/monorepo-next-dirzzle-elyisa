/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { SiteConfigContract } from "@repo/contract";
import { siteConfigService } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const siteconfigController = new Elysia({ prefix: "/siteconfig" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => siteConfigService.findAll(query, { db, auth }), { query: SiteConfigContract.ListQuery })
  .post("/", ({ body, auth, db }) => siteConfigService.create(body, { db, auth }), { body: SiteConfigContract.Create })
  .delete("/:id", ({ params, auth, db }) => siteConfigService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });