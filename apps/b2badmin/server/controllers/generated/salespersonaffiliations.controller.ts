import { Elysia, t } from "elysia";
import { SalespersonAffiliationsContract } from "@repo/contract";
import { salespersonAffiliationsService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const salespersonaffiliationsController = new Elysia({ prefix: "/salespersonaffiliations" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("SALESPERSONAFFILIATIONS_VIEW")) throw new Error("Forbidden");
    return salespersonAffiliationsService.findAll(query);
  }, {
    query: SalespersonAffiliationsContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("SALESPERSONAFFILIATIONS_CREATE")) throw new Error("Forbidden");
    return salespersonAffiliationsService.create(body);
  }, {
    body: SalespersonAffiliationsContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("SALESPERSONAFFILIATIONS_EDIT")) throw new Error("Forbidden");
    return salespersonAffiliationsService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: SalespersonAffiliationsContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("SALESPERSONAFFILIATIONS_DELETE")) throw new Error("Forbidden");
    return salespersonAffiliationsService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
