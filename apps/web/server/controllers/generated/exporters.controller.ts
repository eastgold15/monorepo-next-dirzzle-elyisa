import { Elysia, t } from "elysia";
import { ExportersContract } from "@repo/contract";
import { exportersService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const exportersController = new Elysia({ prefix: "/exporters" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return exportersService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: ExportersContract.ListQuery,
    detail: {
      summary: "获取Exporters列表",
      description: "获取所有Exporters的列表信息",
      tags: ["Exporters"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return exportersService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: ExportersContract.Create,
    detail: {
      summary: "创建Exporters",
      description: "创建新的Exporters",
      tags: ["Exporters"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return exportersService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: ExportersContract.Patch,
    detail: {
      summary: "更新Exporters",
      description: "根据ID更新Exporters信息",
      tags: ["Exporters"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return exportersService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Exporters",
      description: "根据ID删除Exporters",
      tags: ["Exporters"]
    }
  });
