import { Elysia, t } from "elysia";
import { ProductTemplateContract } from "@repo/contract";
import { productTemplateService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const producttemplateController = new Elysia({ prefix: "/producttemplate" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("PRODUCTTEMPLATE_VIEW")) throw new Error("Forbidden");
    return productTemplateService.findAll(query,auth);
  }, {
    query: ProductTemplateContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("PRODUCTTEMPLATE_CREATE")) throw new Error("Forbidden");
    return productTemplateService.create(body,auth);
  }, {
    body: ProductTemplateContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("PRODUCTTEMPLATE_EDIT")) throw new Error("Forbidden");
    return productTemplateService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: ProductTemplateContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("PRODUCTTEMPLATE_DELETE")) throw new Error("Forbidden");
    return productTemplateService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
