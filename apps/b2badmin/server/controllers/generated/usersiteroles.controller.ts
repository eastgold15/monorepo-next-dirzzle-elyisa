import { Elysia, t } from "elysia";
import { UserSiteRolesContract } from "@repo/contract";
import { userSiteRolesService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const usersiterolesController = new Elysia({ prefix: "/usersiteroles" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("USERSITEROLES_VIEW")) throw new Error("Forbidden");
    return userSiteRolesService.findAll(query,auth);
  }, {
    query: UserSiteRolesContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("USERSITEROLES_CREATE")) throw new Error("Forbidden");
    return userSiteRolesService.create(body,auth);
  }, {
    body: UserSiteRolesContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("USERSITEROLES_EDIT")) throw new Error("Forbidden");
    return userSiteRolesService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: UserSiteRolesContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("USERSITEROLES_DELETE")) throw new Error("Forbidden");
    return userSiteRolesService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
