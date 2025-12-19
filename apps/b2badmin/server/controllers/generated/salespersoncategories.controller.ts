import { Elysia, t } from "elysia";
import { SalespersonCategoriesContract } from "@repo/contract";
import { salespersonCategoriesService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const salespersoncategoriesController = new Elysia({ prefix: "/salespersoncategories" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("SALESPERSONCATEGORIES_VIEW")) throw new Error("Forbidden");
    return salespersonCategoriesService.findAll(query,auth);
  }, {
    query: SalespersonCategoriesContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("SALESPERSONCATEGORIES_CREATE")) throw new Error("Forbidden");
    return salespersonCategoriesService.create(body,auth);
  }, {
    body: SalespersonCategoriesContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("SALESPERSONCATEGORIES_EDIT")) throw new Error("Forbidden");
    return salespersonCategoriesService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: SalespersonCategoriesContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("SALESPERSONCATEGORIES_DELETE")) throw new Error("Forbidden");
    return salespersonCategoriesService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
