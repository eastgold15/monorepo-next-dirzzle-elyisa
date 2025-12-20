/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { ExportersContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";
import { exportersService } from "../../modules/index";

export const exportersController = new Elysia({ prefix: "/exporters" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get(
    "/",
    ({ query, db, siteId }) => exportersService.findAll(query, { db, siteId }),
    { query: ExportersContract.ListQuery }
  )
  .post(
    "/",
    ({ body, db, siteId }) => exportersService.create(body, { db, siteId }),
    { body: ExportersContract.Create }
  )
  .patch(
    "/:id",
    ({ params, body, db, siteId }) =>
      exportersService.update(params.id, body, { db, siteId }),
    { params: t.Object({ id: t.String() }), body: ExportersContract.Patch }
  )
  .delete(
    "/:id",
    ({ params, db, siteId }) =>
      exportersService.delete(params.id, { db, siteId }),
    { params: t.Object({ id: t.String() }) }
  );
