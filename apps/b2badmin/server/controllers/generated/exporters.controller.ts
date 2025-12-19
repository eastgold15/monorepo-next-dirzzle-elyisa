import { Elysia, t } from "elysia";
import { ExportersContract } from "@repo/contract";
import { exportersService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const exportersController = new Elysia({ prefix: "/exporters" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("EXPORTERS_VIEW")) throw new Error("Forbidden");
    return exportersService.findAll(query,auth);
  }, {
    query: ExportersContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("EXPORTERS_CREATE")) throw new Error("Forbidden");
    return exportersService.create(body,auth);
  }, {
    body: ExportersContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("EXPORTERS_EDIT")) throw new Error("Forbidden");
    return exportersService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: ExportersContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("EXPORTERS_DELETE")) throw new Error("Forbidden");
    return exportersService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
