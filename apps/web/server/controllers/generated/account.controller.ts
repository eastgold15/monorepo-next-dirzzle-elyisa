import { Elysia, t } from "elysia";
import { AccountContract } from "@repo/contract";
import { accountService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";

export const accountController = new Elysia({ prefix: "/account" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return accountService.findAll(query, { db, user: null });
  }, {
    query: AccountContract.ListQuery,
    detail: {
      summary: "获取Account列表",
      description: "获取所有Account的列表信息",
      tags: ["Account"]
    }
  })
  .post("/", ({ body, db }) => {
    return accountService.create(body, { db, user: null });
  }, {
    body: AccountContract.Create,
    detail: {
      summary: "创建Account",
      description: "创建新的Account",
      tags: ["Account"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return accountService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: AccountContract.Patch,
    detail: {
      summary: "更新Account",
      description: "根据ID更新Account信息",
      tags: ["Account"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return accountService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Account",
      description: "根据ID删除Account",
      tags: ["Account"]
    }
  });
