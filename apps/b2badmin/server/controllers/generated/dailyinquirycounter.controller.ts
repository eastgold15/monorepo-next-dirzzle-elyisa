import { Elysia, t } from "elysia";
import { DailyInquiryCounterContract } from "@repo/contract";
import { dailyInquiryCounterService } from "../../modules/services";
import { authGuard } from "../../middleware/auth";

export const dailyinquirycounterController = new Elysia({ prefix: "/dailyinquirycounter" })
  .use(authGuard)
  .get("/", ({ query, permissions }) => {
    if (!permissions.includes("DAILYINQUIRYCOUNTER_VIEW")) throw new Error("Forbidden");
    return dailyInquiryCounterService.findAll(query);
  }, {
    query: DailyInquiryCounterContract.ListQuery
  })
  .post("/", ({ body, permissions }) => {
    if (!permissions.includes("DAILYINQUIRYCOUNTER_CREATE")) throw new Error("Forbidden");
    return dailyInquiryCounterService.create(body);
  }, {
    body: DailyInquiryCounterContract.Create
  })
  .patch("/:id", ({ params, body, permissions }) => {
    if (!permissions.includes("DAILYINQUIRYCOUNTER_EDIT")) throw new Error("Forbidden");
    return dailyInquiryCounterService.update(params.id, body);
  }, {
    params: t.Object({ id: t.String() }),
    body: DailyInquiryCounterContract.Patch
  })
  .delete("/:id", ({ params, permissions }) => {
    if (!permissions.includes("DAILYINQUIRYCOUNTER_DELETE")) throw new Error("Forbidden");
    return dailyInquiryCounterService.delete(params.id);
  }, {
    params: t.Object({ id: t.String() })
  });
