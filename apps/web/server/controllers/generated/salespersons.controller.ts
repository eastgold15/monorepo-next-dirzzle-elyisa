import { Elysia, t } from "elysia";
import { SalespersonsContract } from "@repo/contract";
import { salespersonsService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const salespersonsController = new Elysia({ prefix: "/salespersons" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return salespersonsService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: SalespersonsContract.ListQuery,
    detail: {
      summary: "获取Salespersons列表",
      description: "获取所有Salespersons的列表信息",
      tags: ["Salespersons"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return salespersonsService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: SalespersonsContract.Create,
    detail: {
      summary: "创建Salespersons",
      description: "创建新的Salespersons",
      tags: ["Salespersons"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return salespersonsService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: SalespersonsContract.Patch,
    detail: {
      summary: "更新Salespersons",
      description: "根据ID更新Salespersons信息",
      tags: ["Salespersons"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return salespersonsService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Salespersons",
      description: "根据ID删除Salespersons",
      tags: ["Salespersons"]
    }
  });
