import { Elysia, t } from "elysia";
import { MasterContract } from "@repo/contract";
import { masterService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const masterController = new Elysia({ prefix: "/master" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return masterService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: MasterContract.ListQuery,
    detail: {
      summary: "获取Master列表",
      description: "获取所有Master的列表信息",
      tags: ["Master"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return masterService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: MasterContract.Create,
    detail: {
      summary: "创建Master",
      description: "创建新的Master",
      tags: ["Master"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return masterService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: MasterContract.Patch,
    detail: {
      summary: "更新Master",
      description: "根据ID更新Master信息",
      tags: ["Master"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return masterService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Master",
      description: "根据ID删除Master",
      tags: ["Master"]
    }
  });
