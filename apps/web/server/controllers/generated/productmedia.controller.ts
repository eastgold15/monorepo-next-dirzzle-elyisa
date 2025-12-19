import { Elysia, t } from "elysia";
import { ProductMediaContract } from "@repo/contract";
import { productMediaService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";

export const productmediaController = new Elysia({ prefix: "/productmedia" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return productMediaService.findAll(query, { db, user: null });
  }, {
    query: ProductMediaContract.ListQuery,
    detail: {
      summary: "获取ProductMedia列表",
      description: "获取所有ProductMedia的列表信息",
      tags: ["ProductMedia"]
    }
  })
  .post("/", ({ body, db }) => {
    return productMediaService.create(body, { db, user: null });
  }, {
    body: ProductMediaContract.Create,
    detail: {
      summary: "创建ProductMedia",
      description: "创建新的ProductMedia",
      tags: ["ProductMedia"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return productMediaService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: ProductMediaContract.Patch,
    detail: {
      summary: "更新ProductMedia",
      description: "根据ID更新ProductMedia信息",
      tags: ["ProductMedia"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return productMediaService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除ProductMedia",
      description: "根据ID删除ProductMedia",
      tags: ["ProductMedia"]
    }
  });
