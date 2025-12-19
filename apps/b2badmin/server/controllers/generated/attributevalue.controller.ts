import { Elysia, t } from "elysia";
import { AttributeValueContract } from "@repo/contract";
import { attributeValueService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const attributevalueController = new Elysia({ prefix: "/attributevalue" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("ATTRIBUTEVALUE_VIEW")) throw new Error("Forbidden");
    return attributeValueService.findAll(query,auth);
  }, {
    query: AttributeValueContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("ATTRIBUTEVALUE_CREATE")) throw new Error("Forbidden");
    return attributeValueService.create(body,auth);
  }, {
    body: AttributeValueContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("ATTRIBUTEVALUE_EDIT")) throw new Error("Forbidden");
    return attributeValueService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: AttributeValueContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("ATTRIBUTEVALUE_DELETE")) throw new Error("Forbidden");
    return attributeValueService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
