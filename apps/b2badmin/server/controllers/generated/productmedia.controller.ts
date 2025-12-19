import { Elysia, t } from "elysia";
import { ProductMediaContract } from "@repo/contract";
import { productMediaService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const productmediaController = new Elysia({ prefix: "/productmedia" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("PRODUCTMEDIA_VIEW")) throw new Error("Forbidden");
    return productMediaService.findAll(query,auth);
  }, {
    query: ProductMediaContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("PRODUCTMEDIA_CREATE")) throw new Error("Forbidden");
    return productMediaService.create(body,auth);
  }, {
    body: ProductMediaContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("PRODUCTMEDIA_EDIT")) throw new Error("Forbidden");
    return productMediaService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: ProductMediaContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("PRODUCTMEDIA_DELETE")) throw new Error("Forbidden");
    return productMediaService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
