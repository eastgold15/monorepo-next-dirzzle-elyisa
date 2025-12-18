import { Elysia, t } from "elysia";
import { ProductsContract } from "@repo/contract";
import { productsService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const productsController = new Elysia({ prefix: "/products" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("PRODUCTS_VIEW")) throw new Error("Forbidden");
    return productsService.findAll(query);
  }, {
    query: ProductsContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("PRODUCTS_CREATE")) throw new Error("Forbidden");
    return productsService.create(body);
  }, {
    body: ProductsContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("PRODUCTS_EDIT")) throw new Error("Forbidden");
    return productsService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: ProductsContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("PRODUCTS_DELETE")) throw new Error("Forbidden");
    return productsService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
