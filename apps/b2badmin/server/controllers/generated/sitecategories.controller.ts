import { Elysia, t } from "elysia";
import { SiteCategoriesContract } from "@repo/contract";
import { siteCategoriesService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const sitecategoriesController = new Elysia({ prefix: "/sitecategories" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("SITECATEGORIES_VIEW")) throw new Error("Forbidden");
    return siteCategoriesService.findAll(query);
  }, {
    query: SiteCategoriesContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("SITECATEGORIES_CREATE")) throw new Error("Forbidden");
    return siteCategoriesService.create(body);
  }, {
    body: SiteCategoriesContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("SITECATEGORIES_EDIT")) throw new Error("Forbidden");
    return siteCategoriesService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: SiteCategoriesContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("SITECATEGORIES_DELETE")) throw new Error("Forbidden");
    return siteCategoriesService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
