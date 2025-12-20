/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { AdsContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";
import { adsService } from "../../modules/index";

export const adsController = new Elysia({ prefix: "/ads" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get(
    "/",
    ({ query, db, siteId }) => adsService.findAll(query, { db, siteId }),
    { query: AdsContract.ListQuery }
  )
  .post(
    "/",
    ({ body, db, siteId }) => adsService.create(body, { db, siteId }),
    { body: AdsContract.Create }
  )
  .patch(
    "/:id",
    ({ params, body, db, siteId }) =>
      adsService.update(params.id, body, { db, siteId }),
    { params: t.Object({ id: t.String() }), body: AdsContract.Patch }
  )
  .delete(
    "/:id",
    ({ params, db, siteId }) => adsService.delete(params.id, { db, siteId }),
    { params: t.Object({ id: t.String() }) }
  );
