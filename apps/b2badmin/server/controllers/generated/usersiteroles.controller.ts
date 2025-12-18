import { Elysia, t } from "elysia";
import { UserSiteRolesContract } from "@repo/contract";
import { userSiteRolesService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const usersiterolesController = new Elysia({ prefix: "/usersiteroles" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("USERSITEROLES_VIEW")) throw new Error("Forbidden");
    return userSiteRolesService.findAll(query);
  }, {
    query: UserSiteRolesContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("USERSITEROLES_CREATE")) throw new Error("Forbidden");
    return userSiteRolesService.create(body);
  }, {
    body: UserSiteRolesContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("USERSITEROLES_EDIT")) throw new Error("Forbidden");
    return userSiteRolesService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: UserSiteRolesContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("USERSITEROLES_DELETE")) throw new Error("Forbidden");
    return userSiteRolesService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
