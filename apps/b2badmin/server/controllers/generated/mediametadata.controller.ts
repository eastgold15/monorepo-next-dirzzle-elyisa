import { Elysia, t } from "elysia";
import { MediaMetadataContract } from "@repo/contract";
import { mediaMetadataService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const mediametadataController = new Elysia({ prefix: "/mediametadata" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("MEDIAMETADATA_VIEW")) throw new Error("Forbidden");
    return mediaMetadataService.findAll(query,auth);
  }, {
    query: MediaMetadataContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("MEDIAMETADATA_CREATE")) throw new Error("Forbidden");
    return mediaMetadataService.create(body,auth);
  }, {
    body: MediaMetadataContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("MEDIAMETADATA_EDIT")) throw new Error("Forbidden");
    return mediaMetadataService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: MediaMetadataContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("MEDIAMETADATA_DELETE")) throw new Error("Forbidden");
    return mediaMetadataService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
