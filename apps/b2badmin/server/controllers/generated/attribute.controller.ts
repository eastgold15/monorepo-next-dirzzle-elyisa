import { Elysia, t } from "elysia";
import { AttributeContract } from "@repo/contract";
import { attributeService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const attributeController = new Elysia({ prefix: "/attribute" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("ATTRIBUTE_VIEW")) throw new Error("Forbidden");
    return attributeService.findAll(query);
  }, {
    query: AttributeContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("ATTRIBUTE_CREATE")) throw new Error("Forbidden");
    return attributeService.create(body);
  }, {
    body: AttributeContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("ATTRIBUTE_EDIT")) throw new Error("Forbidden");
    return attributeService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: AttributeContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("ATTRIBUTE_DELETE")) throw new Error("Forbidden");
    return attributeService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
