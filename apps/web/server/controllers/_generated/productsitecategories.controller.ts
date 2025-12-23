/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { ProductSiteCategoriesContract } from "@repo/contract";
import { productSiteCategoriesService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const productsitecategoriesController = new Elysia({ prefix: "/productsitecategories" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => productSiteCategoriesService.findAll(query, { db, siteId }), { query: ProductSiteCategoriesContract.ListQuery })
  .post("/", ({ body, db, siteId }) => productSiteCategoriesService.create(body, { db, siteId }), { body: ProductSiteCategoriesContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => productSiteCategoriesService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: ProductSiteCategoriesContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => productSiteCategoriesService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });