import { Elysia, t } from "elysia";
import { SkuMediaContract } from "@repo/contract";
import { skuMediaService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";

export const skumediaController = new Elysia({ prefix: "/skumedia" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return skuMediaService.findAll(query, { db, user: null });
  }, {
    query: SkuMediaContract.ListQuery,
    detail: {
      summary: "获取SkuMedia列表",
      description: "获取所有SkuMedia的列表信息",
      tags: ["SkuMedia"]
    }
  })
  .post("/", ({ body, db }) => {
    return skuMediaService.create(body, { db, user: null });
  }, {
    body: SkuMediaContract.Create,
    detail: {
      summary: "创建SkuMedia",
      description: "创建新的SkuMedia",
      tags: ["SkuMedia"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return skuMediaService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: SkuMediaContract.Patch,
    detail: {
      summary: "更新SkuMedia",
      description: "根据ID更新SkuMedia信息",
      tags: ["SkuMedia"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return skuMediaService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除SkuMedia",
      description: "根据ID删除SkuMedia",
      tags: ["SkuMedia"]
    }
  });
