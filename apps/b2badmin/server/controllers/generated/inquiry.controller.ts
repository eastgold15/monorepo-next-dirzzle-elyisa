import { Elysia, t } from "elysia";
import { InquiryContract } from "@repo/contract";
import { inquiryService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const inquiryController = new Elysia({ prefix: "/inquiry" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("INQUIRY_VIEW")) throw new Error("Forbidden");
    return inquiryService.findAll(query);
  }, {
    query: InquiryContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("INQUIRY_CREATE")) throw new Error("Forbidden");
    return inquiryService.create(body);
  }, {
    body: InquiryContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("INQUIRY_EDIT")) throw new Error("Forbidden");
    return inquiryService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: InquiryContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("INQUIRY_DELETE")) throw new Error("Forbidden");
    return inquiryService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
