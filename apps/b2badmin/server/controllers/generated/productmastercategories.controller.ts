import { Elysia, t } from "elysia";
import { ProductMasterCategoriesContract } from "@repo/contract";
import { productMasterCategoriesService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const productmastercategoriesController = new Elysia({ prefix: "/productmastercategories" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("PRODUCTMASTERCATEGORIES_VIEW")) throw new Error("Forbidden");
    return productMasterCategoriesService.findAll(query,auth);
  }, {
    query: ProductMasterCategoriesContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("PRODUCTMASTERCATEGORIES_CREATE")) throw new Error("Forbidden");
    return productMasterCategoriesService.create(body,auth);
  }, {
    body: ProductMasterCategoriesContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("PRODUCTMASTERCATEGORIES_EDIT")) throw new Error("Forbidden");
    return productMasterCategoriesService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: ProductMasterCategoriesContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("PRODUCTMASTERCATEGORIES_DELETE")) throw new Error("Forbidden");
    return productMasterCategoriesService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
