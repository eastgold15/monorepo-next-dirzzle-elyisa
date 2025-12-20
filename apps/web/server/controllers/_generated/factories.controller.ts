/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { FactoriesContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";
import { factoriesService } from "../../modules/index";

export const factoriesController = new Elysia({ prefix: "/factories" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get(
    "/",
    ({ query, db, siteId }) => factoriesService.findAll(query, { db, siteId }),
    { query: FactoriesContract.ListQuery }
  )
  .post(
    "/",
    ({ body, db, siteId }) => factoriesService.create(body, { db, siteId }),
    { body: FactoriesContract.Create }
  )
  .patch(
    "/:id",
    ({ params, body, db, siteId }) =>
      factoriesService.update(params.id, body, { db, siteId }),
    { params: t.Object({ id: t.String() }), body: FactoriesContract.Patch }
  )
  .delete(
    "/:id",
    ({ params, db, siteId }) =>
      factoriesService.delete(params.id, { db, siteId }),
    { params: t.Object({ id: t.String() }) }
  );
