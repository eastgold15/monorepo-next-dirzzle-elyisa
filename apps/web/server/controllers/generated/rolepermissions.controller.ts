import { Elysia, t } from "elysia";
import { RolePermissionsContract } from "@repo/contract";
import { rolePermissionsService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const rolepermissionsController = new Elysia({ prefix: "/rolepermissions" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return rolePermissionsService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: RolePermissionsContract.ListQuery,
    detail: {
      summary: "获取RolePermissions列表",
      description: "获取所有RolePermissions的列表信息",
      tags: ["RolePermissions"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return rolePermissionsService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: RolePermissionsContract.Create,
    detail: {
      summary: "创建RolePermissions",
      description: "创建新的RolePermissions",
      tags: ["RolePermissions"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return rolePermissionsService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: RolePermissionsContract.Patch,
    detail: {
      summary: "更新RolePermissions",
      description: "根据ID更新RolePermissions信息",
      tags: ["RolePermissions"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return rolePermissionsService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除RolePermissions",
      description: "根据ID删除RolePermissions",
      tags: ["RolePermissions"]
    }
  });
