import { Elysia, t } from "elysia";
import { TranslationDictContract } from "@repo/contract";
import { translationDictService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";

export const translationdictController = new Elysia({ prefix: "/translationdict" })
  .use(dbPlugin)
  .get("/", ({ query, db }) => {
    return translationDictService.findAll(query, { db, user: null });
  }, {
    query: TranslationDictContract.ListQuery,
    detail: {
      summary: "获取TranslationDict列表",
      description: "获取所有TranslationDict的列表信息",
      tags: ["TranslationDict"]
    }
  })
  .post("/", ({ body, db }) => {
    return translationDictService.create(body, { db, user: null });
  }, {
    body: TranslationDictContract.Create,
    detail: {
      summary: "创建TranslationDict",
      description: "创建新的TranslationDict",
      tags: ["TranslationDict"]
    }
  })
  .patch("/:id", ({ params, body, db }) => {
    return translationDictService.update(params.id, body, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    body: TranslationDictContract.Patch,
    detail: {
      summary: "更新TranslationDict",
      description: "根据ID更新TranslationDict信息",
      tags: ["TranslationDict"]
    }
  })
  .delete("/:id", ({ params, db }) => {
    return translationDictService.delete(params.id, { db, user: null });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除TranslationDict",
      description: "根据ID删除TranslationDict",
      tags: ["TranslationDict"]
    }
  });
