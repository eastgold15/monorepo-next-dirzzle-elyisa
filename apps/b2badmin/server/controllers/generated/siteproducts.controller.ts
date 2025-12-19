import { Elysia, t } from "elysia";
import { SiteProductsContract } from "@repo/contract";
import { siteProductsService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const siteproductsController = new Elysia({ prefix: "/siteproducts" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("SITEPRODUCTS_VIEW")) throw new Error("Forbidden");
    return siteProductsService.findAll(query,auth);
  }, {
    query: SiteProductsContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("SITEPRODUCTS_CREATE")) throw new Error("Forbidden");
    return siteProductsService.create(body,auth);
  }, {
    body: SiteProductsContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("SITEPRODUCTS_EDIT")) throw new Error("Forbidden");
    return siteProductsService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: SiteProductsContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("SITEPRODUCTS_DELETE")) throw new Error("Forbidden");
    return siteProductsService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
