/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { SitesContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";
import { sitesService } from "../../modules/index";

export const sitesController = new Elysia({ prefix: "/sites" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get(
    "/",
    ({ query, db, siteId }) => sitesService.findAll(query, { db, siteId }),
    { query: SitesContract.ListQuery }
  )
  .post(
    "/",
    ({ body, db, siteId }) => sitesService.create(body, { db, siteId }),
    { body: SitesContract.Create }
  )
  .patch(
    "/:id",
    ({ params, body, db, siteId }) =>
      sitesService.update(params.id, body, { db, siteId }),
    { params: t.Object({ id: t.String() }), body: SitesContract.Patch }
  )
  .delete(
    "/:id",
    ({ params, db, siteId }) => sitesService.delete(params.id, { db, siteId }),
    { params: t.Object({ id: t.String() }) }
  );
