import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { heroCardsTable } from "../../table.schema";
import { PaginationParams, SortParams } from "../../helper/query-types.t.model";

const _Select = createSelectSchema(heroCardsTable);
const _Insert = createInsertSchema(heroCardsTable);

export const HeroCardsContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(heroCardsTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type HeroCardsDTO = {
  Response: typeof HeroCardsContract.Response.static;
  Create: typeof HeroCardsContract.Create.static;
  Update: typeof HeroCardsContract.Update.static;
  Patch: typeof HeroCardsContract.Patch.static;
  ListQuery: typeof HeroCardsContract.ListQuery.static;
};
