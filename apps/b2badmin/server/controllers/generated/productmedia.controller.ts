import { Elysia, t } from "elysia";
import { ProductMediaContract } from "@repo/contract";
import { productMediaService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const productmediaController = new Elysia({ prefix: "/productmedia" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("PRODUCTMEDIA_VIEW")) throw new Error("Forbidden");
    return productMediaService.findAll(query);
  }, {
    query: ProductMediaContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("PRODUCTMEDIA_CREATE")) throw new Error("Forbidden");
    return productMediaService.create(body);
  }, {
    body: ProductMediaContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("PRODUCTMEDIA_EDIT")) throw new Error("Forbidden");
    return productMediaService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: ProductMediaContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("PRODUCTMEDIA_DELETE")) throw new Error("Forbidden");
    return productMediaService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
