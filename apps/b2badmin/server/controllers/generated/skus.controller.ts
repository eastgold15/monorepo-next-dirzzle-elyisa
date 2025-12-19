import { Elysia, t } from "elysia";
import { SkusContract } from "@repo/contract";
import { skusService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const skusController = new Elysia({ prefix: "/skus" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("SKUS_VIEW")) throw new Error("Forbidden");
    return skusService.findAll(query,auth);
  }, {
    query: SkusContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("SKUS_CREATE")) throw new Error("Forbidden");
    return skusService.create(body,auth);
  }, {
    body: SkusContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("SKUS_EDIT")) throw new Error("Forbidden");
    return skusService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: SkusContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("SKUS_DELETE")) throw new Error("Forbidden");
    return skusService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
