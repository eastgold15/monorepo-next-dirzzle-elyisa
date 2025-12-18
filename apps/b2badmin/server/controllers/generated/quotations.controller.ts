import { Elysia, t } from "elysia";
import { QuotationsContract } from "@repo/contract";
import { quotationsService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const quotationsController = new Elysia({ prefix: "/quotations" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("QUOTATIONS_VIEW")) throw new Error("Forbidden");
    return quotationsService.findAll(query);
  }, {
    query: QuotationsContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("QUOTATIONS_CREATE")) throw new Error("Forbidden");
    return quotationsService.create(body);
  }, {
    body: QuotationsContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("QUOTATIONS_EDIT")) throw new Error("Forbidden");
    return quotationsService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: QuotationsContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("QUOTATIONS_DELETE")) throw new Error("Forbidden");
    return quotationsService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
