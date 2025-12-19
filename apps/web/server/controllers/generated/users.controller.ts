import { Elysia, t } from "elysia";
import { UsersContract } from "@repo/contract";
import { usersService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";

export const usersController = new Elysia({ prefix: "/users" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return usersService.findAll(query, { db, user: null });
  }, {
    query: UsersContract.ListQuery,
    detail: {
      summary: "获取Users列表",
      description: "获取所有Users的列表信息",
      tags: ["Users"]
    }
  })
  .post("/", ({ body, db }) => {
    return usersService.create(body, { db, user: null });
  }, {
    body: UsersContract.Create,
    detail: {
      summary: "创建Users",
      description: "创建新的Users",
      tags: ["Users"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return usersService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: UsersContract.Patch,
    detail: {
      summary: "更新Users",
      description: "根据ID更新Users信息",
      tags: ["Users"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return usersService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Users",
      description: "根据ID删除Users",
      tags: ["Users"]
    }
  });
