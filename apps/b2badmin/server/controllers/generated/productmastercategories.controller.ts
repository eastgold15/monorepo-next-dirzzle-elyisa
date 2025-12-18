import { Elysia, t } from "elysia";
import { ProductMasterCategoriesContract } from "@repo/contract";
import { productMasterCategoriesService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const productmastercategoriesController = new Elysia({ prefix: "/productmastercategories" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("PRODUCTMASTERCATEGORIES_VIEW")) throw new Error("Forbidden");
    return productMasterCategoriesService.findAll(query);
  }, {
    query: ProductMasterCategoriesContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("PRODUCTMASTERCATEGORIES_CREATE")) throw new Error("Forbidden");
    return productMasterCategoriesService.create(body);
  }, {
    body: ProductMasterCategoriesContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("PRODUCTMASTERCATEGORIES_EDIT")) throw new Error("Forbidden");
    return productMasterCategoriesService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: ProductMasterCategoriesContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("PRODUCTMASTERCATEGORIES_DELETE")) throw new Error("Forbidden");
    return productMasterCategoriesService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
