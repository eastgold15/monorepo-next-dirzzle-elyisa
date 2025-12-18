import { Elysia, t } from "elysia";
import { SessionContract } from "@repo/contract";
import { sessionService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const sessionController = new Elysia({ prefix: "/session" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("SESSION_VIEW")) throw new Error("Forbidden");
    return sessionService.findAll(query);
  }, {
    query: SessionContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("SESSION_CREATE")) throw new Error("Forbidden");
    return sessionService.create(body);
  }, {
    body: SessionContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("SESSION_EDIT")) throw new Error("Forbidden");
    return sessionService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: SessionContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("SESSION_DELETE")) throw new Error("Forbidden");
    return sessionService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
