import { Elysia, t } from "elysia";
import { AccountContract } from "@repo/contract";
import { accountService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const accountController = new Elysia({ prefix: "/account" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return accountService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: AccountContract.ListQuery,
    detail: {
      summary: "获取Account列表",
      description: "获取所有Account的列表信息",
      tags: ["Account"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return accountService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: AccountContract.Create,
    detail: {
      summary: "创建Account",
      description: "创建新的Account",
      tags: ["Account"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return accountService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: AccountContract.Patch,
    detail: {
      summary: "更新Account",
      description: "根据ID更新Account信息",
      tags: ["Account"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return accountService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Account",
      description: "根据ID删除Account",
      tags: ["Account"]
    }
  });
