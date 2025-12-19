import { Elysia, t } from "elysia";
import { DailyInquiryCounterContract } from "@repo/contract";
import { dailyInquiryCounterService } from "~/modules/index";
import { authGuardMid } from "~/middleware/auth";

export const dailyinquirycounterController = new Elysia({ prefix: "/dailyinquirycounter" })
  .use(authGuardMid)
  .get("/", ({ query, permissions,auth }) => {
    if (!permissions.includes("DAILYINQUIRYCOUNTER_VIEW")) throw new Error("Forbidden");
    return dailyInquiryCounterService.findAll(query,auth);
  }, {
    query: DailyInquiryCounterContract.ListQuery
  })
  .post("/", ({ body, permissions,auth }) => {
    if (!permissions.includes("DAILYINQUIRYCOUNTER_CREATE")) throw new Error("Forbidden");
    return dailyInquiryCounterService.create(body,auth);
  }, {
    body: DailyInquiryCounterContract.Create
  })
  .patch("/:id", ({ params, body, permissions,auth }) => {
    if (!permissions.includes("DAILYINQUIRYCOUNTER_EDIT")) throw new Error("Forbidden");
    return dailyInquiryCounterService.update(params.id, body,auth);
  }, {
    params: t.Object({ id: t.String() }),
    body: DailyInquiryCounterContract.Patch
  })
  .delete("/:id", ({ params, permissions,auth }) => {
    if (!permissions.includes("DAILYINQUIRYCOUNTER_DELETE")) throw new Error("Forbidden");
    return dailyInquiryCounterService.delete(params.id,auth);
  }, {
    params: t.Object({ id: t.String() })
  });
