import { Elysia, t } from "elysia";
import { SitesContract } from "@repo/contract";
import { sitesService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const sitesController = new Elysia({ prefix: "/sites" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("SITES_VIEW")) throw new Error("Forbidden");
    return sitesService.findAll(query);
  }, {
    query: SitesContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("SITES_CREATE")) throw new Error("Forbidden");
    return sitesService.create(body);
  }, {
    body: SitesContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("SITES_EDIT")) throw new Error("Forbidden");
    return sitesService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: SitesContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("SITES_DELETE")) throw new Error("Forbidden");
    return sitesService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
