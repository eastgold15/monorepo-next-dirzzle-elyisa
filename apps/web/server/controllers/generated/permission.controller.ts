import { Elysia, t } from "elysia";
import { PermissionContract } from "@repo/contract";
import { permissionService } from "../modules/index";
import { dbPlugin } from "../db/connection";

export const permissionController = new Elysia({ prefix: "/permission" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return permissionService.findAll(query, { db, user: null });
  }, {
    query: PermissionContract.ListQuery,
    detail: {
      summary: "获取Permission列表",
      description: "获取所有Permission的列表信息",
      tags: ["Permission"]
    }
  })
  .post("/", ({ body, db }) => {
    return permissionService.create(body, { db, user: null });
  }, {
    body: PermissionContract.Create,
    detail: {
      summary: "创建Permission",
      description: "创建新的Permission",
      tags: ["Permission"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return permissionService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: PermissionContract.Patch,
    detail: {
      summary: "更新Permission",
      description: "根据ID更新Permission信息",
      tags: ["Permission"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return permissionService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Permission",
      description: "根据ID删除Permission",
      tags: ["Permission"]
    }
  });
