import { Elysia, t } from "elysia";
import { RoleContract } from "@repo/contract";
import { roleService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const roleController = new Elysia({ prefix: "/role" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("ROLE_VIEW")) throw new Error("Forbidden");
    return roleService.findAll(query,auth);
  }, {
    query: RoleContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("ROLE_CREATE")) throw new Error("Forbidden");
    return roleService.create(body,auth);
  }, {
    body: RoleContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("ROLE_EDIT")) throw new Error("Forbidden");
    return roleService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: RoleContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("ROLE_DELETE")) throw new Error("Forbidden");
    return roleService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
