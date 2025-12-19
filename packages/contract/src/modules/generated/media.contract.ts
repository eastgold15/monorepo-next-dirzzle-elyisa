import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { mediaTable } from "../../table.schema";
import { PaginationParams, SortParams } from "~/helper/query-types.t.model";

const _Select = createSelectSchema(mediaTable);
const _Insert = createInsertSchema(mediaTable);

export const MediaContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(mediaTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type MediaDTO = {
  Response: typeof MediaContract.Response.static;
  Create: typeof MediaContract.Create.static;
  Update: typeof MediaContract.Update.static;
  Patch: typeof MediaContract.Patch.static;
  ListQuery: typeof MediaContract.ListQuery.static;
};
