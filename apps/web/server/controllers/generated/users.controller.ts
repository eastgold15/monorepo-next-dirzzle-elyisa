import { Elysia, t } from "elysia";
import { UsersContract } from "@repo/contract";
import { usersService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const usersController = new Elysia({ prefix: "/users" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return usersService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: UsersContract.ListQuery,
    detail: {
      summary: "获取Users列表",
      description: "获取所有Users的列表信息",
      tags: ["Users"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return usersService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: UsersContract.Create,
    detail: {
      summary: "创建Users",
      description: "创建新的Users",
      tags: ["Users"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return usersService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: UsersContract.Patch,
    detail: {
      summary: "更新Users",
      description: "根据ID更新Users信息",
      tags: ["Users"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return usersService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Users",
      description: "根据ID删除Users",
      tags: ["Users"]
    }
  });
