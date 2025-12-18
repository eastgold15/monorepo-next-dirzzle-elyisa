import { Elysia, t } from "elysia";
import { MasterContract } from "@repo/contract";
import { MasterService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const masterController = new Elysia({ prefix: "/master" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("MASTER_VIEW")) throw new Error("Forbidden");
    return MasterService.findAll(query);
  }, {
    query: MasterContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("MASTER_CREATE")) throw new Error("Forbidden");
    return MasterService.create(body);
  }, {
    body: MasterContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("MASTER_EDIT")) throw new Error("Forbidden");
    return MasterService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: MasterContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("MASTER_DELETE")) throw new Error("Forbidden");
    return MasterService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
