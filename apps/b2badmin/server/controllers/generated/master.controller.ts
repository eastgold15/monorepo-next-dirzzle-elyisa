import { Elysia, t } from "elysia";
import { MasterContract } from "@repo/contract";
import { masterService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const masterController = new Elysia({ prefix: "/master" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("MASTER_VIEW")) throw new Error("Forbidden");
    return masterService.findAll(query,auth);
  }, {
    query: MasterContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("MASTER_CREATE")) throw new Error("Forbidden");
    return masterService.create(body,auth);
  }, {
    body: MasterContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("MASTER_EDIT")) throw new Error("Forbidden");
    return masterService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: MasterContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("MASTER_DELETE")) throw new Error("Forbidden");
    return masterService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
