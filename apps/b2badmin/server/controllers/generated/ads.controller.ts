import { Elysia, t } from "elysia";
import { AdsContract } from "@repo/contract";
import { adsService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const adsController = new Elysia({ prefix: "/ads" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("ADS_VIEW")) throw new Error("Forbidden");
    return adsService.findAll(query);
  }, {
    query: AdsContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("ADS_CREATE")) throw new Error("Forbidden");
    return adsService.create(body);
  }, {
    body: AdsContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("ADS_EDIT")) throw new Error("Forbidden");
    return adsService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: AdsContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("ADS_DELETE")) throw new Error("Forbidden");
    return adsService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
