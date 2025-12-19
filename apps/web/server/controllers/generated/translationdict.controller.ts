import { Elysia, t } from "elysia";
import { TranslationDictContract } from "@repo/contract";
import { translationDictService } from "~/modules/index";
import { dbPlugin } from "~/db/connection";
import { siteMiddleware } from "~/middleware/site";

export const translationdictController = new Elysia({ prefix: "/translationdict" })
  .use(dbPlugin)
  .use(siteMiddleware)
  .get("/", ({ query, db, siteId, siteType, factoryId, exporterId }) => {
    return translationDictService.findAll(query, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    query: TranslationDictContract.ListQuery,
    detail: {
      summary: "获取TranslationDict列表",
      description: "获取所有TranslationDict的列表信息",
      tags: ["TranslationDict"]
    }
  })
  .post("/", ({ body, db, siteId, siteType, factoryId, exporterId }) => {
    return translationDictService.create(body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    body: TranslationDictContract.Create,
    detail: {
      summary: "创建TranslationDict",
      description: "创建新的TranslationDict",
      tags: ["TranslationDict"]
    }
  })
  .patch("/:id", ({ params, body, db, siteId, siteType, factoryId, exporterId }) => {
    return translationDictService.update(params.id, body, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    body: TranslationDictContract.Patch,
    detail: {
      summary: "更新TranslationDict",
      description: "根据ID更新TranslationDict信息",
      tags: ["TranslationDict"]
    }
  })
  .delete("/:id", ({ params, db, siteId, siteType, factoryId, exporterId }) => {
    return translationDictService.delete(params.id, {
      db,
      siteId,
      siteType,
      factoryId,
      exporterId
    });
  }, {
    params: t.Object({ id: t.String() }),
    detail: {
      summary: "删除TranslationDict",
      description: "根据ID删除TranslationDict",
      tags: ["TranslationDict"]
    }
  });
