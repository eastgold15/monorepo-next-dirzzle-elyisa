import { Elysia, t } from "elysia";
import { RolePermissionsContract } from "@repo/contract";
import { rolePermissionsService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const rolepermissionsController = new Elysia({ prefix: "/rolepermissions" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("ROLEPERMISSIONS_VIEW")) throw new Error("Forbidden");
    return rolePermissionsService.findAll(query,auth);
  }, {
    query: RolePermissionsContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("ROLEPERMISSIONS_CREATE")) throw new Error("Forbidden");
    return rolePermissionsService.create(body,auth);
  }, {
    body: RolePermissionsContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("ROLEPERMISSIONS_EDIT")) throw new Error("Forbidden");
    return rolePermissionsService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: RolePermissionsContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("ROLEPERMISSIONS_DELETE")) throw new Error("Forbidden");
    return rolePermissionsService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
