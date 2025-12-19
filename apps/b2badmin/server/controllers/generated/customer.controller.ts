import { Elysia, t } from "elysia";
import { CustomerContract } from "@repo/contract";
import { customerService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const customerController = new Elysia({ prefix: "/customer" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("CUSTOMER_VIEW")) throw new Error("Forbidden");
    return customerService.findAll(query,auth);
  }, {
    query: CustomerContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("CUSTOMER_CREATE")) throw new Error("Forbidden");
    return customerService.create(body,auth);
  }, {
    body: CustomerContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("CUSTOMER_EDIT")) throw new Error("Forbidden");
    return customerService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: CustomerContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("CUSTOMER_DELETE")) throw new Error("Forbidden");
    return customerService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
