import { Elysia, t } from "elysia";
import { MasterContract } from "@repo/contract";
import { masterService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const masterController = new Elysia({ prefix: "/master" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("MASTER_VIEW")) throw new Error("Forbidden");
    return masterService.findAll(query);
  }, {
    query: MasterContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("MASTER_CREATE")) throw new Error("Forbidden");
    return masterService.create(body);
  }, {
    body: MasterContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("MASTER_EDIT")) throw new Error("Forbidden");
    return masterService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: MasterContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("MASTER_DELETE")) throw new Error("Forbidden");
    return masterService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
