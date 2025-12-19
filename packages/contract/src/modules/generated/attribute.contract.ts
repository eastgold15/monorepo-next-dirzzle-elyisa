import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { t } from "elysia";
import { PaginationParams, SortParams } from "../../helper/query-types.model";
import { attributeTable } from "../../table.schema";

const _Select = createSelectSchema(attributeTable);
const _Insert = createInsertSchema(attributeTable);

export const AttributeContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(attributeTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type AttributeDTO = {
  Response: typeof AttributeContract.Response.static;
  Create: typeof AttributeContract.Create.static;
  Update: typeof AttributeContract.Update.static;
  Patch: typeof AttributeContract.Patch.static;
  ListQuery: typeof AttributeContract.ListQuery.static;
};
