/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { ProductMasterCategoriesContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { productMasterCategoriesService } from "../../modules/index";

export const productmastercategoriesController = new Elysia({
  prefix: "/productmastercategories",
})
  .use(dbPlugin)
  .use(authGuardMid)
  .get(
    "/",
    ({ query, auth, db }) =>
      productMasterCategoriesService.findAll(query, { db, auth }),
    { query: ProductMasterCategoriesContract.ListQuery }
  )
  .post(
    "/",
    ({ body, auth, db }) =>
      productMasterCategoriesService.create(body, { db, auth }),
    { body: ProductMasterCategoriesContract.Create }
  )
  .delete(
    "/:id",
    ({ params, auth, db }) =>
      productMasterCategoriesService.delete(params.id, { db, auth }),
    { params: t.Object({ id: t.String() }) }
  )
  .get("/tree", ({ auth, db }) => "无", {
    detail: {
      summary: "获取分类树",
      description: "获取所有分类的树状结构",
    },
  });
