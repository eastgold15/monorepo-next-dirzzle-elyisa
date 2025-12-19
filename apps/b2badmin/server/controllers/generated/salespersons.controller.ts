import { Elysia, t } from "elysia";
import { SalespersonsContract } from "@repo/contract";
import { salespersonsService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const salespersonsController = new Elysia({ prefix: "/salespersons" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("SALESPERSONS_VIEW")) throw new Error("Forbidden");
    return salespersonsService.findAll(query,auth);
  }, {
    query: SalespersonsContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("SALESPERSONS_CREATE")) throw new Error("Forbidden");
    return salespersonsService.create(body,auth);
  }, {
    body: SalespersonsContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("SALESPERSONS_EDIT")) throw new Error("Forbidden");
    return salespersonsService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: SalespersonsContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("SALESPERSONS_DELETE")) throw new Error("Forbidden");
    return salespersonsService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
