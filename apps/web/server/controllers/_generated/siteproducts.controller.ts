/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { SiteProductsContract } from "@repo/contract";
import { siteProductsService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const siteproductsController = new Elysia({ prefix: "/siteproducts" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => siteProductsService.findAll(query, { db, siteId }), { query: SiteProductsContract.ListQuery })
  .post("/", ({ body, db, siteId }) => siteProductsService.create(body, { db, siteId }), { body: SiteProductsContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => siteProductsService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: SiteProductsContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => siteProductsService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });