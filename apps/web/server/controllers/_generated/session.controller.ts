/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { SessionContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";
import { sessionService } from "../../modules/index";

export const sessionController = new Elysia({ prefix: "/session" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get(
    "/",
    ({ query, db, siteId }) => sessionService.findAll(query, { db, siteId }),
    { query: SessionContract.ListQuery }
  )
  .post(
    "/",
    ({ body, db, siteId }) => sessionService.create(body, { db, siteId }),
    { body: SessionContract.Create }
  )
  .patch(
    "/:id",
    ({ params, body, db, siteId }) =>
      sessionService.update(params.id, body, { db, siteId }),
    { params: t.Object({ id: t.String() }), body: SessionContract.Patch }
  )
  .delete(
    "/:id",
    ({ params, db, siteId }) =>
      sessionService.delete(params.id, { db, siteId }),
    { params: t.Object({ id: t.String() }) }
  );
