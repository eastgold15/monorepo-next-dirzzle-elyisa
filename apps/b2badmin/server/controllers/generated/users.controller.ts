import { Elysia, t } from "elysia";
import { UsersContract } from "@repo/contract";
import { usersService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const usersController = new Elysia({ prefix: "/users" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("USERS_VIEW")) throw new Error("Forbidden");
    return usersService.findAll(query,auth);
  }, {
    query: UsersContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("USERS_CREATE")) throw new Error("Forbidden");
    return usersService.create(body,auth);
  }, {
    body: UsersContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("USERS_EDIT")) throw new Error("Forbidden");
    return usersService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: UsersContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("USERS_DELETE")) throw new Error("Forbidden");
    return usersService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
