import { Elysia, t } from "elysia";
import { RoleContract } from "@repo/contract";
import { roleService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";

export const roleController = new Elysia({ prefix: "/role" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return roleService.findAll(query, { db, user: null });
  }, {
    query: RoleContract.ListQuery,
    detail: {
      summary: "获取Role列表",
      description: "获取所有Role的列表信息",
      tags: ["Role"]
    }
  })
  .post("/", ({ body, db }) => {
    return roleService.create(body, { db, user: null });
  }, {
    body: RoleContract.Create,
    detail: {
      summary: "创建Role",
      description: "创建新的Role",
      tags: ["Role"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return roleService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: RoleContract.Patch,
    detail: {
      summary: "更新Role",
      description: "根据ID更新Role信息",
      tags: ["Role"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return roleService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Role",
      description: "根据ID删除Role",
      tags: ["Role"]
    }
  });
