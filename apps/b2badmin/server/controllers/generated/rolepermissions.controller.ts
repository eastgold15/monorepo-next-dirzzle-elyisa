import { Elysia, t } from "elysia";
import { RolePermissionsContract } from "@repo/contract";
import { rolePermissionsService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const rolepermissionsController = new Elysia({ prefix: "/rolepermissions" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("ROLEPERMISSIONS_VIEW")) throw new Error("Forbidden");
    return rolePermissionsService.findAll(query);
  }, {
    query: RolePermissionsContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("ROLEPERMISSIONS_CREATE")) throw new Error("Forbidden");
    return rolePermissionsService.create(body);
  }, {
    body: RolePermissionsContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("ROLEPERMISSIONS_EDIT")) throw new Error("Forbidden");
    return rolePermissionsService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: RolePermissionsContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("ROLEPERMISSIONS_DELETE")) throw new Error("Forbidden");
    return rolePermissionsService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
