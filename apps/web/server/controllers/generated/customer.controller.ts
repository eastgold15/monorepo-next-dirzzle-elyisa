import { Elysia, t } from "elysia";
import { CustomerContract } from "@repo/contract";
import { customerService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const customerController = new Elysia({ prefix: "/customer" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return customerService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: CustomerContract.ListQuery,
    detail: {
      summary: "获取Customer列表",
      description: "获取所有Customer的列表信息",
      tags: ["Customer"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return customerService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: CustomerContract.Create,
    detail: {
      summary: "创建Customer",
      description: "创建新的Customer",
      tags: ["Customer"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return customerService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: CustomerContract.Patch,
    detail: {
      summary: "更新Customer",
      description: "根据ID更新Customer信息",
      tags: ["Customer"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return customerService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Customer",
      description: "根据ID删除Customer",
      tags: ["Customer"]
    }
  });
