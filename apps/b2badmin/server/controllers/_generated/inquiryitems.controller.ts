/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { Elysia, t } from "elysia";
import { InquiryItemsContract } from "@repo/contract";
import { inquiryItemsService } from "../../modules/index";
import { authGuardMid } from "~/middleware/auth";
import { dbPlugin } from "~/db/connection";

export const inquiryitemsController = new Elysia({ prefix: "/inquiryitems" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => inquiryItemsService.findAll(query, { db, auth }), { query: InquiryItemsContract.ListQuery })
  .post("/", ({ body, auth, db }) => inquiryItemsService.create(body, { db, auth }), { body: InquiryItemsContract.Create })
  .delete("/:id", ({ params, auth, db }) => inquiryItemsService.delete(params.id, { db, auth }), { params: t.Object({ id: t.String() }) });