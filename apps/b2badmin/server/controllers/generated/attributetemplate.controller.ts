import { Elysia, t } from "elysia";
import { AttributeTemplateContract } from "@repo/contract";
import { attributeTemplateService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const attributetemplateController = new Elysia({ prefix: "/attributetemplate" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("ATTRIBUTETEMPLATE_VIEW")) throw new Error("Forbidden");
    return attributeTemplateService.findAll(query);
  }, {
    query: AttributeTemplateContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("ATTRIBUTETEMPLATE_CREATE")) throw new Error("Forbidden");
    return attributeTemplateService.create(body);
  }, {
    body: AttributeTemplateContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("ATTRIBUTETEMPLATE_EDIT")) throw new Error("Forbidden");
    return attributeTemplateService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: AttributeTemplateContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("ATTRIBUTETEMPLATE_DELETE")) throw new Error("Forbidden");
    return attributeTemplateService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
