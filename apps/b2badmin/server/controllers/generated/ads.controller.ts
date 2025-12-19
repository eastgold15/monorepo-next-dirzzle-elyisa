import { Elysia, t } from "elysia";
import { AdsContract } from "@repo/contract";
import { adsService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const adsController = new Elysia({ prefix: "/ads" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("ADS_VIEW")) throw new Error("Forbidden");
    return adsService.findAll(query,auth);
  }, {
    query: AdsContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("ADS_CREATE")) throw new Error("Forbidden");
    return adsService.create(body,auth);
  }, {
    body: AdsContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("ADS_EDIT")) throw new Error("Forbidden");
    return adsService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: AdsContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("ADS_DELETE")) throw new Error("Forbidden");
    return adsService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
