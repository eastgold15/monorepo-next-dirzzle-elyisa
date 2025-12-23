/**
 * 🤖 【Contract - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { t } from "elysia";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-typebox";
import { skusTable } from "../../table.schema";
import { PaginationParams, SortParams } from "../../helper/query-types.model";

const _Select = createSelectSchema(skusTable);
const _Insert = createInsertSchema(skusTable);
const _baseUpdate = createUpdateSchema(skusTable)
const Create = t.Omit(_Insert, ["id", "createdAt", "updatedAt"]);

const FilterParams = t.Object({
  productId: t.Optional(t.String({ format: 'uuid' })),
  siteId: t.Optional(t.String({ format: 'uuid' })),
  status: t.Optional(t.Numeric()), // 使用 Numeric 自动处理字符串转数字
  skuCode: t.Optional(t.String()),
  search: t.Optional(t.String()),
});
export const SkusContract = {
  Response: _Select,
  Create,
  Update: _baseUpdate,
  Patch: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"])),
  ListQuery: t.Intersect([
    FilterParams,
    PaginationParams,
    SortParams,
  ]),
  ListResponse: t.Object({ data: t.Array(_Select), total: t.Number() }),
} as const;
