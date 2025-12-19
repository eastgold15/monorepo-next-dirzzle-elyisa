import { Elysia, t } from "elysia";
import { SkuMediaContract } from "@repo/contract";
import { skuMediaService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const skumediaController = new Elysia({ prefix: "/skumedia" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("SKUMEDIA_VIEW")) throw new Error("Forbidden");
    return skuMediaService.findAll(query,auth);
  }, {
    query: SkuMediaContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("SKUMEDIA_CREATE")) throw new Error("Forbidden");
    return skuMediaService.create(body,auth);
  }, {
    body: SkuMediaContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("SKUMEDIA_EDIT")) throw new Error("Forbidden");
    return skuMediaService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: SkuMediaContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("SKUMEDIA_DELETE")) throw new Error("Forbidden");
    return skuMediaService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
