import { Elysia, t } from "elysia";
import { ProductTemplateContract } from "@repo/contract";
import { productTemplateService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const producttemplateController = new Elysia({ prefix: "/producttemplate" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("PRODUCTTEMPLATE_VIEW")) throw new Error("Forbidden");
    return productTemplateService.findAll(query);
  }, {
    query: ProductTemplateContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("PRODUCTTEMPLATE_CREATE")) throw new Error("Forbidden");
    return productTemplateService.create(body);
  }, {
    body: ProductTemplateContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("PRODUCTTEMPLATE_EDIT")) throw new Error("Forbidden");
    return productTemplateService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: ProductTemplateContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("PRODUCTTEMPLATE_DELETE")) throw new Error("Forbidden");
    return productTemplateService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
