import { Elysia, t } from "elysia";
import { ProductsContract } from "@repo/contract";
import { productsService } from "../modules/index";
import { dbPlugin } from "../db/connection";

export const productsController = new Elysia({ prefix: "/products" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return productsService.findAll(query, { db, user: null });
  }, {
    query: ProductsContract.ListQuery,
    detail: {
      summary: "获取Products列表",
      description: "获取所有Products的列表信息",
      tags: ["Products"]
    }
  })
  .post("/", ({ body, db }) => {
    return productsService.create(body, { db, user: null });
  }, {
    body: ProductsContract.Create,
    detail: {
      summary: "创建Products",
      description: "创建新的Products",
      tags: ["Products"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return productsService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: ProductsContract.Patch,
    detail: {
      summary: "更新Products",
      description: "根据ID更新Products信息",
      tags: ["Products"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return productsService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除Products",
      description: "根据ID删除Products",
      tags: ["Products"]
    }
  });
