import { Elysia, t } from "elysia";
import { SalespersonsContract } from "@repo/contract";
import { salespersonsService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const salespersonsController = new Elysia({ prefix: "/salespersons" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("SALESPERSONS_VIEW")) throw new Error("Forbidden");
    return salespersonsService.findAll(query);
  }, {
    query: SalespersonsContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("SALESPERSONS_CREATE")) throw new Error("Forbidden");
    return salespersonsService.create(body);
  }, {
    body: SalespersonsContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("SALESPERSONS_EDIT")) throw new Error("Forbidden");
    return salespersonsService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: SalespersonsContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("SALESPERSONS_DELETE")) throw new Error("Forbidden");
    return salespersonsService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
