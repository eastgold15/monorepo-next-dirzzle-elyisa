import { Elysia, t } from "elysia";
import { QuotationItemsContract } from "@repo/contract";
import { quotationItemsService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const quotationitemsController = new Elysia({ prefix: "/quotationitems" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("QUOTATIONITEMS_VIEW")) throw new Error("Forbidden");
    return quotationItemsService.findAll(query);
  }, {
    query: QuotationItemsContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("QUOTATIONITEMS_CREATE")) throw new Error("Forbidden");
    return quotationItemsService.create(body);
  }, {
    body: QuotationItemsContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("QUOTATIONITEMS_EDIT")) throw new Error("Forbidden");
    return quotationItemsService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: QuotationItemsContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("QUOTATIONITEMS_DELETE")) throw new Error("Forbidden");
    return quotationItemsService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
