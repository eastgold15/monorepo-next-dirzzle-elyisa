/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { SiteProductsContract } from "@repo/contract";
import { siteProductsService } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const siteproductsController = new Elysia({ prefix: "/siteproducts" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => siteProductsService.findAll(query, { db, auth }), { query: SiteProductsContract.ListQuery })
  .post("/", ({ body, auth, db }) => siteProductsService.create(body, { db, auth }), { body: SiteProductsContract.Create })
  .delete("/:id", ({ params, auth, db }) => siteProductsService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });