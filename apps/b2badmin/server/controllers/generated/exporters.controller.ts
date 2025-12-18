import { Elysia, t } from "elysia";
import { ExportersContract } from "@repo/contract";
import { exportersService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const exportersController = new Elysia({ prefix: "/exporters" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("EXPORTERS_VIEW")) throw new Error("Forbidden");
    return exportersService.findAll(query);
  }, {
    query: ExportersContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("EXPORTERS_CREATE")) throw new Error("Forbidden");
    return exportersService.create(body);
  }, {
    body: ExportersContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("EXPORTERS_EDIT")) throw new Error("Forbidden");
    return exportersService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: ExportersContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("EXPORTERS_DELETE")) throw new Error("Forbidden");
    return exportersService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
