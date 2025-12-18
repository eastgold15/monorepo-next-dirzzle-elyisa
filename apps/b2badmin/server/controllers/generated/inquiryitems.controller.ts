import { Elysia, t } from "elysia";
import { InquiryItemsContract } from "@repo/contract";
import { inquiryItemsService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const inquiryitemsController = new Elysia({ prefix: "/inquiryitems" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("INQUIRYITEMS_VIEW")) throw new Error("Forbidden");
    return inquiryItemsService.findAll(query);
  }, {
    query: InquiryItemsContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("INQUIRYITEMS_CREATE")) throw new Error("Forbidden");
    return inquiryItemsService.create(body);
  }, {
    body: InquiryItemsContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("INQUIRYITEMS_EDIT")) throw new Error("Forbidden");
    return inquiryItemsService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: InquiryItemsContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("INQUIRYITEMS_DELETE")) throw new Error("Forbidden");
    return inquiryItemsService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
