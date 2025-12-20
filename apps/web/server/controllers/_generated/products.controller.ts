/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { ProductsContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";
import { productsService } from "../../modules/index";

export const productsController = new Elysia({ prefix: "/products" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get(
    "/",
    ({ query, db, siteId }) => productsService.findAll(query, { db, siteId }),
    { query: ProductsContract.ListQuery }
  )
  .post(
    "/",
    ({ body, db, siteId }) => productsService.create(body, { db, siteId }),
    { body: ProductsContract.Create }
  )
  .patch(
    "/:id",
    ({ params, body, db, siteId }) =>
      productsService.update(params.id, body, { db, siteId }),
    { params: t.Object({ id: t.String() }), body: ProductsContract.Patch }
  )
  .delete(
    "/:id",
    ({ params, db, siteId }) =>
      productsService.delete(params.id, { db, siteId }),
    { params: t.Object({ id: t.String() }) }
  );
