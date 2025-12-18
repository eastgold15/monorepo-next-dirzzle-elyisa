import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { inquiryItemsTable } from "../../table.schema";
import { PaginationParams, SortParams } from "../../helper/query-types.t.model";

const _Select = createSelectSchema(inquiryItemsTable);
const _Insert = createInsertSchema(inquiryItemsTable);

export const InquiryItemsContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(inquiryItemsTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type InquiryItemsDTO = {
  Response: typeof InquiryItemsContract.Response.static;
  Create: typeof InquiryItemsContract.Create.static;
  Update: typeof InquiryItemsContract.Update.static;
  Patch: typeof InquiryItemsContract.Patch.static;
  ListQuery: typeof InquiryItemsContract.ListQuery.static;
};
