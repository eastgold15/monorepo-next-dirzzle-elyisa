import { Elysia, t } from "elysia";
import { ProductTemplateContract } from "@repo/contract";
import { productTemplateService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const producttemplateController = new Elysia({ prefix: "/producttemplate" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return productTemplateService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: ProductTemplateContract.ListQuery,
    detail: {
      summary: "获取ProductTemplate列表",
      description: "获取所有ProductTemplate的列表信息",
      tags: ["ProductTemplate"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return productTemplateService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: ProductTemplateContract.Create,
    detail: {
      summary: "创建ProductTemplate",
      description: "创建新的ProductTemplate",
      tags: ["ProductTemplate"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return productTemplateService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: ProductTemplateContract.Patch,
    detail: {
      summary: "更新ProductTemplate",
      description: "根据ID更新ProductTemplate信息",
      tags: ["ProductTemplate"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return productTemplateService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除ProductTemplate",
      description: "根据ID删除ProductTemplate",
      tags: ["ProductTemplate"]
    }
  });
