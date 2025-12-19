import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { attributeValueTable } from "../../table.schema";
import { PaginationParams, SortParams } from "~/helper/query-types.t.model";

const _Select = createSelectSchema(attributeValueTable);
const _Insert = createInsertSchema(attributeValueTable);

export const AttributeValueContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(attributeValueTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type AttributeValueDTO = {
  Response: typeof AttributeValueContract.Response.static;
  Create: typeof AttributeValueContract.Create.static;
  Update: typeof AttributeValueContract.Update.static;
  Patch: typeof AttributeValueContract.Patch.static;
  ListQuery: typeof AttributeValueContract.ListQuery.static;
};
