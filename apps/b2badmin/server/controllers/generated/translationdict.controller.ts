import { Elysia, t } from "elysia";
import { TranslationDictContract } from "@repo/contract";
import { translationDictService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const translationdictController = new Elysia({ prefix: "/translationdict" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("TRANSLATIONDICT_VIEW")) throw new Error("Forbidden");
    return translationDictService.findAll(query,auth);
  }, {
    query: TranslationDictContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("TRANSLATIONDICT_CREATE")) throw new Error("Forbidden");
    return translationDictService.create(body,auth);
  }, {
    body: TranslationDictContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("TRANSLATIONDICT_EDIT")) throw new Error("Forbidden");
    return translationDictService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: TranslationDictContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("TRANSLATIONDICT_DELETE")) throw new Error("Forbidden");
    return translationDictService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
