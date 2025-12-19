import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { verificationTable } from "../../table.schema";
import { PaginationParams, SortParams } from "~/helper/query-types.t.model";

const _Select = createSelectSchema(verificationTable);
const _Insert = createInsertSchema(verificationTable);

export const VerificationContract = {
  Response: _Select,
  Create: t.Omit(_Insert, ["id", "createdAt", "updatedAt"]),
  Update: createUpdateSchema(verificationTable),
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Object({
    ...t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])).properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;

export type VerificationDTO = {
  Response: typeof VerificationContract.Response.static;
  Create: typeof VerificationContract.Create.static;
  Update: typeof VerificationContract.Update.static;
  Patch: typeof VerificationContract.Patch.static;
  ListQuery: typeof VerificationContract.ListQuery.static;
};
