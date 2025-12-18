import { Elysia, t } from "elysia";
import { HeroCardsContract } from "@repo/contract";
import { heroCardsService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const herocardsController = new Elysia({ prefix: "/herocards" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("HEROCARDS_VIEW")) throw new Error("Forbidden");
    return heroCardsService.findAll(query);
  }, {
    query: HeroCardsContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("HEROCARDS_CREATE")) throw new Error("Forbidden");
    return heroCardsService.create(body);
  }, {
    body: HeroCardsContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("HEROCARDS_EDIT")) throw new Error("Forbidden");
    return heroCardsService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: HeroCardsContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("HEROCARDS_DELETE")) throw new Error("Forbidden");
    return heroCardsService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
