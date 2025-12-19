import { Elysia, t } from "elysia";
import { CustomerContract } from "@repo/contract";
import { customerService } from "../modules/index";
import { dbPlugin } from "../db/connection";

export const customerController = new Elysia({ prefix: "/customer" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return customerService.findAll(query, { db, user: null });
  }, {
    query: CustomerContract.ListQuery,
    detail: {
      summary: "获取Customer列表",
      description: "获取所有Customer的列表信息",
      tags: ["Customer"]
    }
  })
  .post("/", ({ body, db }) => {
    return customerService.create(body, { db, user: null });
  }, {
    body: CustomerContract.Create,
    detail: {
      summary: "创建Customer",
      description: "创建新的Customer",
      tags: ["Customer"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return customerService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: CustomerContract.Patch,
    detail: {
      summary: "更新Customer",
      description: "根据ID更新Customer信息",
      tags: ["Customer"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return customerService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Customer",
      description: "根据ID删除Customer",
      tags: ["Customer"]
    }
  });
