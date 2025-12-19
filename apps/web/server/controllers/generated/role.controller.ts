import { Elysia, t } from "elysia";
import { RoleContract } from "@repo/contract";
import { roleService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const roleController = new Elysia({ prefix: "/role" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return roleService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: RoleContract.ListQuery,
    detail: {
      summary: "获取Role列表",
      description: "获取所有Role的列表信息",
      tags: ["Role"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return roleService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: RoleContract.Create,
    detail: {
      summary: "创建Role",
      description: "创建新的Role",
      tags: ["Role"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return roleService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: RoleContract.Patch,
    detail: {
      summary: "更新Role",
      description: "根据ID更新Role信息",
      tags: ["Role"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return roleService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Role",
      description: "根据ID删除Role",
      tags: ["Role"]
    }
  });
