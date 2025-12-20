/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { QuotationItemsContract } from "@repo/contract";
import { quotationItemsService } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const quotationitemsController = new Elysia({ prefix: "/quotationitems" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => quotationItemsService.findAll(query, { db, auth }), { query: QuotationItemsContract.ListQuery })
  .post("/", ({ body, auth, db }) => quotationItemsService.create(body, { db, auth }), { body: QuotationItemsContract.Create })
  .delete("/:id", ({ params, auth, db }) => quotationItemsService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });