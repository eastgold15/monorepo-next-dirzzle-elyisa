import { Elysia, t } from "elysia";
import { SiteConfigContract } from "@repo/contract";
import { siteConfigService } from "../modules/index";
import { dbPlugin } from "../db/connection";

export const siteconfigController = new Elysia({ prefix: "/siteconfig" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return siteConfigService.findAll(query, { db, user: null });
  }, {
    query: SiteConfigContract.ListQuery,
    detail: {
      summary: "获取SiteConfig列表",
      description: "获取所有SiteConfig的列表信息",
      tags: ["SiteConfig"]
    }
  })
  .post("/", ({ body, db }) => {
    return siteConfigService.create(body, { db, user: null });
  }, {
    body: SiteConfigContract.Create,
    detail: {
      summary: "创建SiteConfig",
      description: "创建新的SiteConfig",
      tags: ["SiteConfig"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return siteConfigService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: SiteConfigContract.Patch,
    detail: {
      summary: "更新SiteConfig",
      description: "根据ID更新SiteConfig信息",
      tags: ["SiteConfig"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return siteConfigService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除SiteConfig",
      description: "根据ID删除SiteConfig",
      tags: ["SiteConfig"]
    }
  });
