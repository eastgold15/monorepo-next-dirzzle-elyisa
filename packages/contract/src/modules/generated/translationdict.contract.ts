import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { translationDictTable } from "../../table.schema";
import { PaginationParams, SortParams } from "../../helper/query-types.t.model";

const _Select = createSelectSchema(translationDictTable);
const _Insert = createInsertSchema(translationDictTable);

export const TranslationDictContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(translationDictTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type TranslationDictDTO = {
  Response: typeof TranslationDictContract.Response.static;
  Create: typeof TranslationDictContract.Create.static;
  Update: typeof TranslationDictContract.Update.static;
  Patch: typeof TranslationDictContract.Patch.static;
  ListQuery: typeof TranslationDictContract.ListQuery.static;
};
