import { Elysia, t } from "elysia";
import { PermissionContract } from "@repo/contract";
import { permissionService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const permissionController = new Elysia({ prefix: "/permission" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return permissionService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: PermissionContract.ListQuery,
    detail: {
      summary: "获取Permission列表",
      description: "获取所有Permission的列表信息",
      tags: ["Permission"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return permissionService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: PermissionContract.Create,
    detail: {
      summary: "创建Permission",
      description: "创建新的Permission",
      tags: ["Permission"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return permissionService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: PermissionContract.Patch,
    detail: {
      summary: "更新Permission",
      description: "根据ID更新Permission信息",
      tags: ["Permission"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return permissionService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Permission",
      description: "根据ID删除Permission",
      tags: ["Permission"]
    }
  });
