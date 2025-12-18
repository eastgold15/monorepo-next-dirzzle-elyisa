import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { userSiteRolesTable } from "../../table.schema";
import { PaginationParams, SortParams } from "../../helper/query-types.t.model";

const _Select = createSelectSchema(userSiteRolesTable);
const _Insert = createInsertSchema(userSiteRolesTable);

export const UserSiteRolesContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(userSiteRolesTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type UserSiteRolesDTO = {
  Response: typeof UserSiteRolesContract.Response.static;
  Create: typeof UserSiteRolesContract.Create.static;
  Update: typeof UserSiteRolesContract.Update.static;
  Patch: typeof UserSiteRolesContract.Patch.static;
  ListQuery: typeof UserSiteRolesContract.ListQuery.static;
};
