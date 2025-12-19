import { Elysia, t } from "elysia";
import { UserSiteRolesContract } from "@repo/contract";
import { userSiteRolesService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const usersiterolesController = new Elysia({ prefix: "/usersiteroles" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return userSiteRolesService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: UserSiteRolesContract.ListQuery,
    detail: {
      summary: "获取UserSiteRoles列表",
      description: "获取所有UserSiteRoles的列表信息",
      tags: ["UserSiteRoles"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return userSiteRolesService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: UserSiteRolesContract.Create,
    detail: {
      summary: "创建UserSiteRoles",
      description: "创建新的UserSiteRoles",
      tags: ["UserSiteRoles"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return userSiteRolesService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: UserSiteRolesContract.Patch,
    detail: {
      summary: "更新UserSiteRoles",
      description: "根据ID更新UserSiteRoles信息",
      tags: ["UserSiteRoles"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return userSiteRolesService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除UserSiteRoles",
      description: "根据ID删除UserSiteRoles",
      tags: ["UserSiteRoles"]
    }
  });
