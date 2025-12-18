import { Elysia, t } from "elysia";
import { SiteProductsContract } from "@repo/contract";
import { siteProductsService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const siteproductsController = new Elysia({ prefix: "/siteproducts" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("SITEPRODUCTS_VIEW")) throw new Error("Forbidden");
    return siteProductsService.findAll(query);
  }, {
    query: SiteProductsContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("SITEPRODUCTS_CREATE")) throw new Error("Forbidden");
    return siteProductsService.create(body);
  }, {
    body: SiteProductsContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("SITEPRODUCTS_EDIT")) throw new Error("Forbidden");
    return siteProductsService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: SiteProductsContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("SITEPRODUCTS_DELETE")) throw new Error("Forbidden");
    return siteProductsService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
