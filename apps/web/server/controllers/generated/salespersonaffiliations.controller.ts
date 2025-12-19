import { Elysia, t } from "elysia";
import { SalespersonAffiliationsContract } from "@repo/contract";
import { salespersonAffiliationsService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const salespersonaffiliationsController = new Elysia({ prefix: "/salespersonaffiliations" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return salespersonAffiliationsService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: SalespersonAffiliationsContract.ListQuery,
    detail: {
      summary: "获取SalespersonAffiliations列表",
      description: "获取所有SalespersonAffiliations的列表信息",
      tags: ["SalespersonAffiliations"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return salespersonAffiliationsService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: SalespersonAffiliationsContract.Create,
    detail: {
      summary: "创建SalespersonAffiliations",
      description: "创建新的SalespersonAffiliations",
      tags: ["SalespersonAffiliations"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return salespersonAffiliationsService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: SalespersonAffiliationsContract.Patch,
    detail: {
      summary: "更新SalespersonAffiliations",
      description: "根据ID更新SalespersonAffiliations信息",
      tags: ["SalespersonAffiliations"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return salespersonAffiliationsService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除SalespersonAffiliations",
      description: "根据ID删除SalespersonAffiliations",
      tags: ["SalespersonAffiliations"]
    }
  });
