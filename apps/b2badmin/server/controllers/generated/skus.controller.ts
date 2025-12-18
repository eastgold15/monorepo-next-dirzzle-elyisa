import { Elysia, t } from "elysia";
import { SkusContract } from "@repo/contract";
import { skusService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const skusController = new Elysia({ prefix: "/skus" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("SKUS_VIEW")) throw new Error("Forbidden");
    return skusService.findAll(query);
  }, {
    query: SkusContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("SKUS_CREATE")) throw new Error("Forbidden");
    return skusService.create(body);
  }, {
    body: SkusContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("SKUS_EDIT")) throw new Error("Forbidden");
    return skusService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: SkusContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("SKUS_DELETE")) throw new Error("Forbidden");
    return skusService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
