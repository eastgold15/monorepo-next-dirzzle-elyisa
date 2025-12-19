import { Elysia, t } from "elysia";
import { SiteCategoriesContract } from "@repo/contract";
import { siteCategoriesService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const sitecategoriesController = new Elysia({ prefix: "/sitecategories" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("SITECATEGORIES_VIEW")) throw new Error("Forbidden");
    return siteCategoriesService.findAll(query,auth);
  }, {
    query: SiteCategoriesContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("SITECATEGORIES_CREATE")) throw new Error("Forbidden");
    return siteCategoriesService.create(body,auth);
  }, {
    body: SiteCategoriesContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("SITECATEGORIES_EDIT")) throw new Error("Forbidden");
    return siteCategoriesService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: SiteCategoriesContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("SITECATEGORIES_DELETE")) throw new Error("Forbidden");
    return siteCategoriesService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
