import { Elysia, t } from "elysia";
import { AccountContract } from "@repo/contract";
import { accountService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const accountController = new Elysia({ prefix: "/account" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("ACCOUNT_VIEW")) throw new Error("Forbidden");
    return accountService.findAll(query,auth);
  }, {
    query: AccountContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("ACCOUNT_CREATE")) throw new Error("Forbidden");
    return accountService.create(body,auth);
  }, {
    body: AccountContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("ACCOUNT_EDIT")) throw new Error("Forbidden");
    return accountService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: AccountContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("ACCOUNT_DELETE")) throw new Error("Forbidden");
    return accountService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
