import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { inquiryTable } from "~/table.schema";
import { PaginationParams, SortParams } from "~/helper/query-types.model";

const _Select = createSelectSchema(inquiryTable);
const _Insert = createInsertSchema(inquiryTable);

export const InquiryContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(inquiryTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type InquiryDTO = {
  Response: typeof InquiryContract.Response.static;
  Create: typeof InquiryContract.Create.static;
  Update: typeof InquiryContract.Update.static;
  Patch: typeof InquiryContract.Patch.static;
  ListQuery: typeof InquiryContract.ListQuery.static;
};
