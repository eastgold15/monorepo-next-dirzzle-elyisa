import { Elysia, t } from "elysia";
import { FactoriesContract } from "@repo/contract";
import { factoriesService } from "../modules/index";
import { dbPlugin } from "../db/connection";

export const factoriesController = new Elysia({ prefix: "/factories" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return factoriesService.findAll(query, { db, user: null });
  }, {
    query: FactoriesContract.ListQuery,
    detail: {
      summary: "获取Factories列表",
      description: "获取所有Factories的列表信息",
      tags: ["Factories"]
    }
  })
  .post("/", ({ body, db }) => {
    return factoriesService.create(body, { db, user: null });
  }, {
    body: FactoriesContract.Create,
    detail: {
      summary: "创建Factories",
      description: "创建新的Factories",
      tags: ["Factories"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return factoriesService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: FactoriesContract.Patch,
    detail: {
      summary: "更新Factories",
      description: "根据ID更新Factories信息",
      tags: ["Factories"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return factoriesService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Factories",
      description: "根据ID删除Factories",
      tags: ["Factories"]
    }
  });
