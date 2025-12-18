import { Elysia, t } from "elysia";
import { SalespersonCategoriesContract } from "@repo/contract";
import { salespersonCategoriesService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const salespersoncategoriesController = new Elysia({ prefix: "/salespersoncategories" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("SALESPERSONCATEGORIES_VIEW")) throw new Error("Forbidden");
    return salespersonCategoriesService.findAll(query);
  }, {
    query: SalespersonCategoriesContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("SALESPERSONCATEGORIES_CREATE")) throw new Error("Forbidden");
    return salespersonCategoriesService.create(body);
  }, {
    body: SalespersonCategoriesContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("SALESPERSONCATEGORIES_EDIT")) throw new Error("Forbidden");
    return salespersonCategoriesService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: SalespersonCategoriesContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("SALESPERSONCATEGORIES_DELETE")) throw new Error("Forbidden");
    return salespersonCategoriesService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
