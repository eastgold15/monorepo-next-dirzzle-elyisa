import { Elysia, t } from "elysia";
import { FactoriesContract } from "@repo/contract";
import { factoriesService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const factoriesController = new Elysia({ prefix: "/factories" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("FACTORIES_VIEW")) throw new Error("Forbidden");
    return factoriesService.findAll(query,auth);
  }, {
    query: FactoriesContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("FACTORIES_CREATE")) throw new Error("Forbidden");
    return factoriesService.create(body,auth);
  }, {
    body: FactoriesContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("FACTORIES_EDIT")) throw new Error("Forbidden");
    return factoriesService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: FactoriesContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("FACTORIES_DELETE")) throw new Error("Forbidden");
    return factoriesService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
