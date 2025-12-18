import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { mediaMetadataTable } from "../../table.schema";
import { PaginationParams, SortParams } from "../../helper/query-types.t.model";

const _Select = createSelectSchema(mediaMetadataTable);
const _Insert = createInsertSchema(mediaMetadataTable);

export const MediaMetadataContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(mediaMetadataTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type MediaMetadataDTO = {
  Response: typeof MediaMetadataContract.Response.static;
  Create: typeof MediaMetadataContract.Create.static;
  Update: typeof MediaMetadataContract.Update.static;
  Patch: typeof MediaMetadataContract.Patch.static;
  ListQuery: typeof MediaMetadataContract.ListQuery.static;
};
