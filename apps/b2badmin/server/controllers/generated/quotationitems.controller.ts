import { Elysia, t } from "elysia";
import { QuotationItemsContract } from "@repo/contract";
import { quotationItemsService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const quotationitemsController = new Elysia({ prefix: "/quotationitems" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("QUOTATIONITEMS_VIEW")) throw new Error("Forbidden");
    return quotationItemsService.findAll(query,auth);
  }, {
    query: QuotationItemsContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("QUOTATIONITEMS_CREATE")) throw new Error("Forbidden");
    return quotationItemsService.create(body,auth);
  }, {
    body: QuotationItemsContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("QUOTATIONITEMS_EDIT")) throw new Error("Forbidden");
    return quotationItemsService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: QuotationItemsContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("QUOTATIONITEMS_DELETE")) throw new Error("Forbidden");
    return quotationItemsService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
