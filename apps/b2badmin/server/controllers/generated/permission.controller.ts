import { Elysia, t } from "elysia";
import { PermissionContract } from "@repo/contract";
import { permissionService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const permissionController = new Elysia({ prefix: "/permission" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("PERMISSION_VIEW")) throw new Error("Forbidden");
    return permissionService.findAll(query,auth);
  }, {
    query: PermissionContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("PERMISSION_CREATE")) throw new Error("Forbidden");
    return permissionService.create(body,auth);
  }, {
    body: PermissionContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("PERMISSION_EDIT")) throw new Error("Forbidden");
    return permissionService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: PermissionContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("PERMISSION_DELETE")) throw new Error("Forbidden");
    return permissionService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
