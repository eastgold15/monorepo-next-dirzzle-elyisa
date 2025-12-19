import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { dailyInquiryCounterTable } from "../../table.schema";
import { PaginationParams, SortParams } from "~/helper/query-types.t.model";

const _Select = createSelectSchema(dailyInquiryCounterTable);
const _Insert = createInsertSchema(dailyInquiryCounterTable);

export const DailyInquiryCounterContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(dailyInquiryCounterTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type DailyInquiryCounterDTO = {
  Response: typeof DailyInquiryCounterContract.Response.static;
  Create: typeof DailyInquiryCounterContract.Create.static;
  Update: typeof DailyInquiryCounterContract.Update.static;
  Patch: typeof DailyInquiryCounterContract.Patch.static;
  ListQuery: typeof DailyInquiryCounterContract.ListQuery.static;
};
