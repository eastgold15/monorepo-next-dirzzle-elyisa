import { Elysia, t } from "elysia";
import { SiteConfigContract } from "@repo/contract";
import { siteConfigService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const siteconfigController = new Elysia({ prefix: "/siteconfig" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("SITECONFIG_VIEW")) throw new Error("Forbidden");
    return siteConfigService.findAll(query);
  }, {
    query: SiteConfigContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("SITECONFIG_CREATE")) throw new Error("Forbidden");
    return siteConfigService.create(body);
  }, {
    body: SiteConfigContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("SITECONFIG_EDIT")) throw new Error("Forbidden");
    return siteConfigService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: SiteConfigContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("SITECONFIG_DELETE")) throw new Error("Forbidden");
    return siteConfigService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
