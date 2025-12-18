import { Elysia, t } from "elysia";
import { MediaContract } from "@repo/contract";
import { mediaService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const mediaController = new Elysia({ prefix: "/media" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("MEDIA_VIEW")) throw new Error("Forbidden");
    return mediaService.findAll(query);
  }, {
    query: MediaContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("MEDIA_CREATE")) throw new Error("Forbidden");
    return mediaService.create(body);
  }, {
    body: MediaContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("MEDIA_EDIT")) throw new Error("Forbidden");
    return mediaService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: MediaContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("MEDIA_DELETE")) throw new Error("Forbidden");
    return mediaService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
