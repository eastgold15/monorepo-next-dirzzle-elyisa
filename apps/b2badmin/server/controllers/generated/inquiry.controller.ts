import { Elysia, t } from "elysia";
import { InquiryContract } from "@repo/contract";
import { inquiryService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const inquiryController = new Elysia({ prefix: "/inquiry" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("INQUIRY_VIEW")) throw new Error("Forbidden");
    return inquiryService.findAll(query,auth);
  }, {
    query: InquiryContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("INQUIRY_CREATE")) throw new Error("Forbidden");
    return inquiryService.create(body,auth);
  }, {
    body: InquiryContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("INQUIRY_EDIT")) throw new Error("Forbidden");
    return inquiryService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: InquiryContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("INQUIRY_DELETE")) throw new Error("Forbidden");
    return inquiryService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
