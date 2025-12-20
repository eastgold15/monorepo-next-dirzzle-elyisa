/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { ProductsContract } from "@repo/contract";
import { productsService } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const productsController = new Elysia({ prefix: "/products" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => productsService.findAll(query, { db, auth }), { query: ProductsContract.ListQuery })
  .post("/", ({ body, auth, db }) => productsService.create(body, { db, auth }), { body: ProductsContract.Create })
  .delete("/:id", ({ params, auth, db }) => productsService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });