import { Elysia, t } from "elysia";
import { ExportersContract } from "@repo/contract";
import { exportersService } from "../modules/index";
import { dbPlugin } from "../db/connection";

export const exportersController = new Elysia({ prefix: "/exporters" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return exportersService.findAll(query, { db, user: null });
  }, {
    query: ExportersContract.ListQuery,
    detail: {
      summary: "获取Exporters列表",
      description: "获取所有Exporters的列表信息",
      tags: ["Exporters"]
    }
  })
  .post("/", ({ body, db }) => {
    return exportersService.create(body, { db, user: null });
  }, {
    body: ExportersContract.Create,
    detail: {
      summary: "创建Exporters",
      description: "创建新的Exporters",
      tags: ["Exporters"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return exportersService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: ExportersContract.Patch,
    detail: {
      summary: "更新Exporters",
      description: "根据ID更新Exporters信息",
      tags: ["Exporters"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return exportersService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Exporters",
      description: "根据ID删除Exporters",
      tags: ["Exporters"]
    }
  });
