/**
 * 🤖 【Web Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { QuotationItemsContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";
import { quotationItemsService } from "../../modules/index";

export const quotationitemsController = new Elysia({
  prefix: "/quotationitems",
})
  .use(dbPlugin)
  .use(siteMiddleware)
  .get(
    "/",
    ({ query, db, siteId }) =>
      quotationItemsService.findAll(query, { db, siteId }),
    { query: QuotationItemsContract.ListQuery }
  )
  .post(
    "/",
    ({ body, db, siteId }) =>
      quotationItemsService.create(body, { db, siteId }),
    { body: QuotationItemsContract.Create }
  )
  .patch(
    "/:id",
    ({ params, body, db, siteId }) =>
      quotationItemsService.update(params.id, body, { db, siteId }),
    { params: t.Object({ id: t.String() }), body: QuotationItemsContract.Patch }
  )
  .delete(
    "/:id",
    ({ params, db, siteId }) =>
      quotationItemsService.delete(params.id, { db, siteId }),
    { params: t.Object({ id: t.String() }) }
  );
