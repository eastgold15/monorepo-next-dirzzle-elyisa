import { Elysia, t } from "elysia";
import { SalespersonAffiliationsContract } from "@repo/contract";
import { salespersonAffiliationsService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const salespersonaffiliationsController = new Elysia({ prefix: "/salespersonaffiliations" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("SALESPERSONAFFILIATIONS_VIEW")) throw new Error("Forbidden");
    return salespersonAffiliationsService.findAll(query,auth);
  }, {
    query: SalespersonAffiliationsContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("SALESPERSONAFFILIATIONS_CREATE")) throw new Error("Forbidden");
    return salespersonAffiliationsService.create(body,auth);
  }, {
    body: SalespersonAffiliationsContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("SALESPERSONAFFILIATIONS_EDIT")) throw new Error("Forbidden");
    return salespersonAffiliationsService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: SalespersonAffiliationsContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("SALESPERSONAFFILIATIONS_DELETE")) throw new Error("Forbidden");
    return salespersonAffiliationsService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
