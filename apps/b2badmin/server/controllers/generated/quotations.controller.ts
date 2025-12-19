import { Elysia, t } from "elysia";
import { QuotationsContract } from "@repo/contract";
import { quotationsService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const quotationsController = new Elysia({ prefix: "/quotations" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("QUOTATIONS_VIEW")) throw new Error("Forbidden");
    return quotationsService.findAll(query,auth);
  }, {
    query: QuotationsContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("QUOTATIONS_CREATE")) throw new Error("Forbidden");
    return quotationsService.create(body,auth);
  }, {
    body: QuotationsContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("QUOTATIONS_EDIT")) throw new Error("Forbidden");
    return quotationsService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: QuotationsContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("QUOTATIONS_DELETE")) throw new Error("Forbidden");
    return quotationsService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
