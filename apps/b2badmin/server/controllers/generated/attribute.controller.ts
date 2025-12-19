import { Elysia, t } from "elysia";
import { AttributeContract } from "@repo/contract";
import { attributeService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const attributeController = new Elysia({ prefix: "/attribute" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("ATTRIBUTE_VIEW")) throw new Error("Forbidden");
    return attributeService.findAll(query,auth);
  }, {
    query: AttributeContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("ATTRIBUTE_CREATE")) throw new Error("Forbidden");
    return attributeService.create(body,auth);
  }, {
    body: AttributeContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("ATTRIBUTE_EDIT")) throw new Error("Forbidden");
    return attributeService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: AttributeContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("ATTRIBUTE_DELETE")) throw new Error("Forbidden");
    return attributeService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
