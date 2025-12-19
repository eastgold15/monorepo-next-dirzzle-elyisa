import { Elysia, t } from "elysia";
import { SessionContract } from "@repo/contract";
import { sessionService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const sessionController = new Elysia({ prefix: "/session" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("SESSION_VIEW")) throw new Error("Forbidden");
    return sessionService.findAll(query,auth);
  }, {
    query: SessionContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("SESSION_CREATE")) throw new Error("Forbidden");
    return sessionService.create(body,auth);
  }, {
    body: SessionContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("SESSION_EDIT")) throw new Error("Forbidden");
    return sessionService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: SessionContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("SESSION_DELETE")) throw new Error("Forbidden");
    return sessionService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
