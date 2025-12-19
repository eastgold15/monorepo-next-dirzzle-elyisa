import { Elysia, t } from "elysia";
import { ProductsContract } from "@repo/contract";
import { productsService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const productsController = new Elysia({ prefix: "/products" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("PRODUCTS_VIEW")) throw new Error("Forbidden");
    return productsService.findAll(query,auth);
  }, {
    query: ProductsContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("PRODUCTS_CREATE")) throw new Error("Forbidden");
    return productsService.create(body,auth);
  }, {
    body: ProductsContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("PRODUCTS_EDIT")) throw new Error("Forbidden");
    return productsService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: ProductsContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("PRODUCTS_DELETE")) throw new Error("Forbidden");
    return productsService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
