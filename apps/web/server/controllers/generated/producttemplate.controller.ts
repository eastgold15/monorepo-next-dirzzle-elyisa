import { Elysia, t } from "elysia";
import { ProductTemplateContract } from "@repo/contract";
import { productTemplateService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";

export const producttemplateController = new Elysia({ prefix: "/producttemplate" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return productTemplateService.findAll(query, { db, user: null });
  }, {
    query: ProductTemplateContract.ListQuery,
    detail: {
      summary: "获取ProductTemplate列表",
      description: "获取所有ProductTemplate的列表信息",
      tags: ["ProductTemplate"]
    }
  })
  .post("/", ({ body, db }) => {
    return productTemplateService.create(body, { db, user: null });
  }, {
    body: ProductTemplateContract.Create,
    detail: {
      summary: "创建ProductTemplate",
      description: "创建新的ProductTemplate",
      tags: ["ProductTemplate"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return productTemplateService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: ProductTemplateContract.Patch,
    detail: {
      summary: "更新ProductTemplate",
      description: "根据ID更新ProductTemplate信息",
      tags: ["ProductTemplate"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return productTemplateService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除ProductTemplate",
      description: "根据ID删除ProductTemplate",
      tags: ["ProductTemplate"]
    }
  });
