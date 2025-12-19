import { Elysia, t } from "elysia";
import { SitesContract } from "@repo/contract";
import { sitesService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const sitesController = new Elysia({ prefix: "/sites" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("SITES_VIEW")) throw new Error("Forbidden");
    return sitesService.findAll(query,auth);
  }, {
    query: SitesContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("SITES_CREATE")) throw new Error("Forbidden");
    return sitesService.create(body,auth);
  }, {
    body: SitesContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("SITES_EDIT")) throw new Error("Forbidden");
    return sitesService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: SitesContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("SITES_DELETE")) throw new Error("Forbidden");
    return sitesService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
