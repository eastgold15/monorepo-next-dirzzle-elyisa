import { Elysia, t } from "elysia";
import { MediaContract } from "@repo/contract";
import { mediaService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const mediaController = new Elysia({ prefix: "/media" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("MEDIA_VIEW")) throw new Error("Forbidden");
    return mediaService.findAll(query,auth);
  }, {
    query: MediaContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("MEDIA_CREATE")) throw new Error("Forbidden");
    return mediaService.create(body,auth);
  }, {
    body: MediaContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("MEDIA_EDIT")) throw new Error("Forbidden");
    return mediaService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: MediaContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("MEDIA_DELETE")) throw new Error("Forbidden");
    return mediaService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
