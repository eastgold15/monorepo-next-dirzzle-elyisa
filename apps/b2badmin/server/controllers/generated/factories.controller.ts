import { Elysia, t } from "elysia";
import { FactoriesContract } from "@repo/contract";
import { factoriesService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const factoriesController = new Elysia({ prefix: "/factories" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("FACTORIES_VIEW")) throw new Error("Forbidden");
    return factoriesService.findAll(query);
  }, {
    query: FactoriesContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("FACTORIES_CREATE")) throw new Error("Forbidden");
    return factoriesService.create(body);
  }, {
    body: FactoriesContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("FACTORIES_EDIT")) throw new Error("Forbidden");
    return factoriesService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: FactoriesContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("FACTORIES_DELETE")) throw new Error("Forbidden");
    return factoriesService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
