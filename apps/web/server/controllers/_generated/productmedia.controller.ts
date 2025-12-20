/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { ProductMediaContract } from "@repo/contract";
import { productMediaService } from "../../modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const productmediaController = new Elysia({ prefix: "/productmedia" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId }) => productMediaService.findAll(query, { db, siteId }), { query: ProductMediaContract.ListQuery })
  .post("/", ({ body, db, siteId }) => productMediaService.create(body, { db, siteId }), { body: ProductMediaContract.Create })
  .patch("/:id", ({ params, body, db, siteId }) => productMediaService.update(params.id, body, { db, siteId }), { params: t.Object({ id: t.String() }), body: ProductMediaContract.Patch })
  .delete("/:id", ({ params, db, siteId }) => productMediaService.delete(params.id, { db, siteId }), { params: t.Object({ id: t.String() }) });