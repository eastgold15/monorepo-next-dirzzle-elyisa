import { Elysia, t } from "elysia";
import { AttributeTemplateContract } from "@repo/contract";
import { attributeTemplateService } from "../modules/index";
import { dbPlugin } from "../db/connection";

export const attributetemplateController = new Elysia({ prefix: "/attributetemplate" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return attributeTemplateService.findAll(query, { db, user: null });
  }, {
    query: AttributeTemplateContract.ListQuery,
    detail: {
      summary: "获取AttributeTemplate列表",
      description: "获取所有AttributeTemplate的列表信息",
      tags: ["AttributeTemplate"]
    }
  })
  .post("/", ({ body, db }) => {
    return attributeTemplateService.create(body, { db, user: null });
  }, {
    body: AttributeTemplateContract.Create,
    detail: {
      summary: "创建AttributeTemplate",
      description: "创建新的AttributeTemplate",
      tags: ["AttributeTemplate"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return attributeTemplateService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: AttributeTemplateContract.Patch,
    detail: {
      summary: "更新AttributeTemplate",
      description: "根据ID更新AttributeTemplate信息",
      tags: ["AttributeTemplate"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return attributeTemplateService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除AttributeTemplate",
      description: "根据ID删除AttributeTemplate",
      tags: ["AttributeTemplate"]
    }
  });
