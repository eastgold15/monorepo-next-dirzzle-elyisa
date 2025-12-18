import { Elysia, t } from "elysia";
import { MediaMetadataContract } from "@repo/contract";
import { mediaMetadataService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const mediametadataController = new Elysia({ prefix: "/mediametadata" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("MEDIAMETADATA_VIEW")) throw new Error("Forbidden");
    return mediaMetadataService.findAll(query);
  }, {
    query: MediaMetadataContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("MEDIAMETADATA_CREATE")) throw new Error("Forbidden");
    return mediaMetadataService.create(body);
  }, {
    body: MediaMetadataContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("MEDIAMETADATA_EDIT")) throw new Error("Forbidden");
    return mediaMetadataService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: MediaMetadataContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("MEDIAMETADATA_DELETE")) throw new Error("Forbidden");
    return mediaMetadataService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
