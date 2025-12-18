import { Elysia, t } from "elysia";
import { CustomerContract } from "@repo/contract";
import { CustomerService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const customerController = new Elysia({ prefix: "/customer" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("CUSTOMER_VIEW")) throw new Error("Forbidden");
    return CustomerService.findAll(query);
  }, {
    query: CustomerContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("CUSTOMER_CREATE")) throw new Error("Forbidden");
    return CustomerService.create(body);
  }, {
    body: CustomerContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("CUSTOMER_EDIT")) throw new Error("Forbidden");
    return CustomerService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: CustomerContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("CUSTOMER_DELETE")) throw new Error("Forbidden");
    return CustomerService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
