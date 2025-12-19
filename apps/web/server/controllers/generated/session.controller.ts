import { Elysia, t } from "elysia";
import { SessionContract } from "@repo/contract";
import { sessionService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const sessionController = new Elysia({ prefix: "/session" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return sessionService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: SessionContract.ListQuery,
    detail: {
      summary: "获取Session列表",
      description: "获取所有Session的列表信息",
      tags: ["Session"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return sessionService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: SessionContract.Create,
    detail: {
      summary: "创建Session",
      description: "创建新的Session",
      tags: ["Session"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return sessionService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: SessionContract.Patch,
    detail: {
      summary: "更新Session",
      description: "根据ID更新Session信息",
      tags: ["Session"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return sessionService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Session",
      description: "根据ID删除Session",
      tags: ["Session"]
    }
  });
