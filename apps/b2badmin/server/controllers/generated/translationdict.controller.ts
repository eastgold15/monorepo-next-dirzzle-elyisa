import { Elysia, t } from "elysia";
import { TranslationDictContract } from "@repo/contract";
import { translationDictService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const translationdictController = new Elysia({ prefix: "/translationdict" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("TRANSLATIONDICT_VIEW")) throw new Error("Forbidden");
    return translationDictService.findAll(query);
  }, {
    query: TranslationDictContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("TRANSLATIONDICT_CREATE")) throw new Error("Forbidden");
    return translationDictService.create(body);
  }, {
    body: TranslationDictContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("TRANSLATIONDICT_EDIT")) throw new Error("Forbidden");
    return translationDictService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: TranslationDictContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("TRANSLATIONDICT_DELETE")) throw new Error("Forbidden");
    return translationDictService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
