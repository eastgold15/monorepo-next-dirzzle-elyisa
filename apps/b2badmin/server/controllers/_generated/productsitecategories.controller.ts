/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { ProductSiteCategoriesContract } from "@repo/contract";
import { productSiteCategoriesService } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const productsitecategoriesController = new Elysia({ prefix: "/productsitecategories" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => productSiteCategoriesService.findAll(query, { db, auth }), { query: ProductSiteCategoriesContract.ListQuery })
  .post("/", ({ body, auth, db }) => productSiteCategoriesService.create(body, { db, auth }), { body: ProductSiteCategoriesContract.Create })
  .delete("/:id", ({ params, auth, db }) => productSiteCategoriesService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });