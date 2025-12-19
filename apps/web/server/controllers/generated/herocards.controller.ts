import { Elysia, t } from "elysia";
import { HeroCardsContract } from "@repo/contract";
import { heroCardsService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const herocardsController = new Elysia({ prefix: "/herocards" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return heroCardsService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: HeroCardsContract.ListQuery,
    detail: {
      summary: "获取HeroCards列表",
      description: "获取所有HeroCards的列表信息",
      tags: ["HeroCards"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return heroCardsService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: HeroCardsContract.Create,
    detail: {
      summary: "创建HeroCards",
      description: "创建新的HeroCards",
      tags: ["HeroCards"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return heroCardsService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: HeroCardsContract.Patch,
    detail: {
      summary: "更新HeroCards",
      description: "根据ID更新HeroCards信息",
      tags: ["HeroCards"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return heroCardsService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除HeroCards",
      description: "根据ID删除HeroCards",
      tags: ["HeroCards"]
    }
  });
