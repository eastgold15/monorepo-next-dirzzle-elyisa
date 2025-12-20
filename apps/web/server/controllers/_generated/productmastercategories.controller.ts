/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { ProductMasterCategoriesContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";
import { productMasterCategoriesService } from "../../modules/index";

export const productmastercategoriesController = new Elysia({
  prefix: "/productmastercategories",
})
  .use(dbPlugin)
  .use(siteMiddleware)
  .get(
    "/",
    ({ query, db, siteId }) =>
      productMasterCategoriesService.findAll(query, { db, siteId }),
    { query: ProductMasterCategoriesContract.ListQuery }
  )
  .post(
    "/",
    ({ body, db, siteId }) =>
      productMasterCategoriesService.create(body, { db, siteId }),
    { body: ProductMasterCategoriesContract.Create }
  )
  .patch(
    "/:id",
    ({ params, body, db, siteId }) =>
      productMasterCategoriesService.update(params.id, body, { db, siteId }),
    {
      params: t.Object({ id: t.String() }),
      body: ProductMasterCategoriesContract.Patch,
    }
  )
  .delete(
    "/:id",
    ({ params, db, siteId }) =>
      productMasterCategoriesService.delete(params.id, { db, siteId }),
    { params: t.Object({ id: t.String() }) }
  );
