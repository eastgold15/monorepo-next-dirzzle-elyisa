/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { SiteConfigContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";
import { siteConfigService } from "../../modules/index";

export const siteconfigController = new Elysia({ prefix: "/siteconfig" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get(
    "/",
    ({ query, db, siteId }) => siteConfigService.findAll(query, { db, siteId }),
    { query: SiteConfigContract.ListQuery }
  )
  .post(
    "/",
    ({ body, db, siteId }) => siteConfigService.create(body, { db, siteId }),
    { body: SiteConfigContract.Create }
  )
  .patch(
    "/:id",
    ({ params, body, db, siteId }) =>
      siteConfigService.update(params.id, body, { db, siteId }),
    { params: t.Object({ id: t.String() }), body: SiteConfigContract.Patch }
  )
  .delete(
    "/:id",
    ({ params, db, siteId }) =>
      siteConfigService.delete(params.id, { db, siteId }),
    { params: t.Object({ id: t.String() }) }
  );
