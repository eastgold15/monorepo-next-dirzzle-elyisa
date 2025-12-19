import { Elysia, t } from "elysia";
import { SessionContract } from "@repo/contract";
import { sessionService } from "../modules/index";
import { dbPlugin } from "../db/connection";

export const sessionController = new Elysia({ prefix: "/session" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return sessionService.findAll(query, { db, user: null });
  }, {
    query: SessionContract.ListQuery,
    detail: {
      summary: "获取Session列表",
      description: "获取所有Session的列表信息",
      tags: ["Session"]
    }
  })
  .post("/", ({ body, db }) => {
    return sessionService.create(body, { db, user: null });
  }, {
    body: SessionContract.Create,
    detail: {
      summary: "创建Session",
      description: "创建新的Session",
      tags: ["Session"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return sessionService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: SessionContract.Patch,
    detail: {
      summary: "更新Session",
      description: "根据ID更新Session信息",
      tags: ["Session"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return sessionService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Session",
      description: "根据ID删除Session",
      tags: ["Session"]
    }
  });
