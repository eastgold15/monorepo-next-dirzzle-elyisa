import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { attributeTemplateTable } from "../../table.schema";
import { PaginationParams, SortParams } from "~/helper/query-types.t.model";

const _Select = createSelectSchema(attributeTemplateTable);
const _Insert = createInsertSchema(attributeTemplateTable);

export const AttributeTemplateContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(attributeTemplateTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type AttributeTemplateDTO = {
  Response: typeof AttributeTemplateContract.Response.static;
  Create: typeof AttributeTemplateContract.Create.static;
  Update: typeof AttributeTemplateContract.Update.static;
  Patch: typeof AttributeTemplateContract.Patch.static;
  ListQuery: typeof AttributeTemplateContract.ListQuery.static;
};
