import { Elysia, t } from "elysia";
import { InquiryItemsContract } from "@repo/contract";
import { inquiryItemsService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const inquiryitemsController = new Elysia({ prefix: "/inquiryitems" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("INQUIRYITEMS_VIEW")) throw new Error("Forbidden");
    return inquiryItemsService.findAll(query,auth);
  }, {
    query: InquiryItemsContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("INQUIRYITEMS_CREATE")) throw new Error("Forbidden");
    return inquiryItemsService.create(body,auth);
  }, {
    body: InquiryItemsContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("INQUIRYITEMS_EDIT")) throw new Error("Forbidden");
    return inquiryItemsService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: InquiryItemsContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("INQUIRYITEMS_DELETE")) throw new Error("Forbidden");
    return inquiryItemsService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
