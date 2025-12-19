import { Elysia, t } from "elysia";
import { SiteConfigContract } from "@repo/contract";
import { siteConfigService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const siteconfigController = new Elysia({ prefix: "/siteconfig" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("SITECONFIG_VIEW")) throw new Error("Forbidden");
    return siteConfigService.findAll(query,auth);
  }, {
    query: SiteConfigContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("SITECONFIG_CREATE")) throw new Error("Forbidden");
    return siteConfigService.create(body,auth);
  }, {
    body: SiteConfigContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("SITECONFIG_EDIT")) throw new Error("Forbidden");
    return siteConfigService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: SiteConfigContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("SITECONFIG_DELETE")) throw new Error("Forbidden");
    return siteConfigService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
