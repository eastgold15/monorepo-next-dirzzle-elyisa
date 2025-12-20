/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { MediaContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";
import { mediaService } from "../../modules/index";

export const mediaController = new Elysia({ prefix: "/media" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get(
    "/",
    ({ query, db, siteId }) => mediaService.findAll(query, { db, siteId }),
    { query: MediaContract.ListQuery }
  )
  .post(
    "/",
    ({ body, db, siteId }) => mediaService.create(body, { db, siteId }),
    { body: MediaContract.Create }
  )
  .patch(
    "/:id",
    ({ params, body, db, siteId }) =>
      mediaService.update(params.id, body, { db, siteId }),
    { params: t.Object({ id: t.String() }), body: MediaContract.Patch }
  )
  .delete(
    "/:id",
    ({ params, db, siteId }) => mediaService.delete(params.id, { db, siteId }),
    { params: t.Object({ id: t.String() }) }
  );
