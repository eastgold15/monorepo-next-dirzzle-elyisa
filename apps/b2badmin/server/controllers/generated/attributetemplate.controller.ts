import { Elysia, t } from "elysia";
import { AttributeTemplateContract } from "@repo/contract";
import { attributeTemplateService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const attributetemplateController = new Elysia({ prefix: "/attributetemplate" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("ATTRIBUTETEMPLATE_VIEW")) throw new Error("Forbidden");
    return attributeTemplateService.findAll(query,auth);
  }, {
    query: AttributeTemplateContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("ATTRIBUTETEMPLATE_CREATE")) throw new Error("Forbidden");
    return attributeTemplateService.create(body,auth);
  }, {
    body: AttributeTemplateContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("ATTRIBUTETEMPLATE_EDIT")) throw new Error("Forbidden");
    return attributeTemplateService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: AttributeTemplateContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("ATTRIBUTETEMPLATE_DELETE")) throw new Error("Forbidden");
    return attributeTemplateService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
