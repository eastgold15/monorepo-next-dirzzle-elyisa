import { Elysia, t } from "elysia";
import { UsersContract } from "@repo/contract";
import { usersService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const usersController = new Elysia({ prefix: "/users" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("USERS_VIEW")) throw new Error("Forbidden");
    return usersService.findAll(query);
  }, {
    query: UsersContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("USERS_CREATE")) throw new Error("Forbidden");
    return usersService.create(body);
  }, {
    body: UsersContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("USERS_EDIT")) throw new Error("Forbidden");
    return usersService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: UsersContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("USERS_DELETE")) throw new Error("Forbidden");
    return usersService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
