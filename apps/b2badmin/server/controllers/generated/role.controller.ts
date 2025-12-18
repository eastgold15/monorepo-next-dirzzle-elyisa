import { Elysia, t } from "elysia";
import { RoleContract } from "@repo/contract";
import { roleService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const roleController = new Elysia({ prefix: "/role" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("ROLE_VIEW")) throw new Error("Forbidden");
    return roleService.findAll(query);
  }, {
    query: RoleContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("ROLE_CREATE")) throw new Error("Forbidden");
    return roleService.create(body);
  }, {
    body: RoleContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("ROLE_EDIT")) throw new Error("Forbidden");
    return roleService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: RoleContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("ROLE_DELETE")) throw new Error("Forbidden");
    return roleService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
