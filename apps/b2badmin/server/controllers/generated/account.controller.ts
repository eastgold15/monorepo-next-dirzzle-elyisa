import { Elysia, t } from "elysia";
import { AccountContract } from "@repo/contract";
import { accountService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const accountController = new Elysia({ prefix: "/account" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("ACCOUNT_VIEW")) throw new Error("Forbidden");
    return accountService.findAll(query);
  }, {
    query: AccountContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("ACCOUNT_CREATE")) throw new Error("Forbidden");
    return accountService.create(body);
  }, {
    body: AccountContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("ACCOUNT_EDIT")) throw new Error("Forbidden");
    return accountService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: AccountContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("ACCOUNT_DELETE")) throw new Error("Forbidden");
    return accountService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
