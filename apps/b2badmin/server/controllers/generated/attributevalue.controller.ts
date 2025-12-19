import { Elysia, t } from "elysia";
import { AttributeValueContract } from "@repo/contract";
import { attributeValueService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const attributevalueController = new Elysia({ prefix: "/attributevalue" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("ATTRIBUTEVALUE_VIEW")) throw new Error("Forbidden");
    return attributeValueService.findAll(query);
  }, {
    query: AttributeValueContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("ATTRIBUTEVALUE_CREATE")) throw new Error("Forbidden");
    return attributeValueService.create(body);
  }, {
    body: AttributeValueContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("ATTRIBUTEVALUE_EDIT")) throw new Error("Forbidden");
    return attributeValueService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: AttributeValueContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("ATTRIBUTEVALUE_DELETE")) throw new Error("Forbidden");
    return attributeValueService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
