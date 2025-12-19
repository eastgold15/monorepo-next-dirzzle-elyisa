import { Elysia, t } from "elysia";
import { MasterContract } from "@repo/contract";
import { masterService } from "../modules/index";
import { dbPlugin } from "../db/connection";

export const masterController = new Elysia({ prefix: "/master" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return masterService.findAll(query, { db, user: null });
  }, {
    query: MasterContract.ListQuery,
    detail: {
      summary: "获取Master列表",
      description: "获取所有Master的列表信息",
      tags: ["Master"]
    }
  })
  .post("/", ({ body, db }) => {
    return masterService.create(body, { db, user: null });
  }, {
    body: MasterContract.Create,
    detail: {
      summary: "创建Master",
      description: "创建新的Master",
      tags: ["Master"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return masterService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: MasterContract.Patch,
    detail: {
      summary: "更新Master",
      description: "根据ID更新Master信息",
      tags: ["Master"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return masterService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Master",
      description: "根据ID删除Master",
      tags: ["Master"]
    }
  });
