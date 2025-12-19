import { Elysia, t } from "elysia";
import { HeroCardsContract } from "@repo/contract";
import { heroCardsService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const herocardsController = new Elysia({ prefix: "/herocards" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("HEROCARDS_VIEW")) throw new Error("Forbidden");
    return heroCardsService.findAll(query,auth);
  }, {
    query: HeroCardsContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("HEROCARDS_CREATE")) throw new Error("Forbidden");
    return heroCardsService.create(body,auth);
  }, {
    body: HeroCardsContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("HEROCARDS_EDIT")) throw new Error("Forbidden");
    return heroCardsService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: HeroCardsContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("HEROCARDS_DELETE")) throw new Error("Forbidden");
    return heroCardsService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
