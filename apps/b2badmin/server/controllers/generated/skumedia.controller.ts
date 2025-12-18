import { Elysia, t } from "elysia";
import { SkuMediaContract } from "@repo/contract";
import { skuMediaService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const skumediaController = new Elysia({ prefix: "/skumedia" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("SKUMEDIA_VIEW")) throw new Error("Forbidden");
    return skuMediaService.findAll(query);
  }, {
    query: SkuMediaContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("SKUMEDIA_CREATE")) throw new Error("Forbidden");
    return skuMediaService.create(body);
  }, {
    body: SkuMediaContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("SKUMEDIA_EDIT")) throw new Error("Forbidden");
    return skuMediaService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: SkuMediaContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("SKUMEDIA_DELETE")) throw new Error("Forbidden");
    return skuMediaService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
