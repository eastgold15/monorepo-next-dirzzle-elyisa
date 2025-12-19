import { Elysia, t } from "elysia";
import { SalespersonsContract } from "@repo/contract";
import { salespersonsService } from "../modules/index";
import { dbPlugin } from "../db/connection";

export const salespersonsController = new Elysia({ prefix: "/salespersons" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return salespersonsService.findAll(query, { db, user: null });
  }, {
    query: SalespersonsContract.ListQuery,
    detail: {
      summary: "获取Salespersons列表",
      description: "获取所有Salespersons的列表信息",
      tags: ["Salespersons"]
    }
  })
  .post("/", ({ body, db }) => {
    return salespersonsService.create(body, { db, user: null });
  }, {
    body: SalespersonsContract.Create,
    detail: {
      summary: "创建Salespersons",
      description: "创建新的Salespersons",
      tags: ["Salespersons"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return salespersonsService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: SalespersonsContract.Patch,
    detail: {
      summary: "更新Salespersons",
      description: "根据ID更新Salespersons信息",
      tags: ["Salespersons"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return salespersonsService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Salespersons",
      description: "根据ID删除Salespersons",
      tags: ["Salespersons"]
    }
  });
