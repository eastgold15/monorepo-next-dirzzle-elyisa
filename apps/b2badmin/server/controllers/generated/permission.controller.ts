import { Elysia, t } from "elysia";
import { PermissionContract } from "@repo/contract";
import { permissionService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const permissionController = new Elysia({ prefix: "/permission" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("PERMISSION_VIEW")) throw new Error("Forbidden");
    return permissionService.findAll(query);
  }, {
    query: PermissionContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("PERMISSION_CREATE")) throw new Error("Forbidden");
    return permissionService.create(body);
  }, {
    body: PermissionContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("PERMISSION_EDIT")) throw new Error("Forbidden");
    return permissionService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: PermissionContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("PERMISSION_DELETE")) throw new Error("Forbidden");
    return permissionService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
