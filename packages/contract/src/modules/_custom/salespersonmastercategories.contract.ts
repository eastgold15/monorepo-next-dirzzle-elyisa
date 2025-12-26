/**
 * ✍️ 【Contract - 业务自定义层】
 * --------------------------------------------------------
 * 💡 你可以直接在此修改 Response, Create, Update 等字段。
 * 🛡️ 脚本检测到文件存在时永远不会覆盖此处。
 * --------------------------------------------------------
 */
import { t } from "elysia";
import { PaginationParams, SortParams } from "../../helper/query-types.model";
import type { InferDTO } from "../../helper/utils";
import { SalespersonMasterCategoriesBase } from "../_generated/salespersonmastercategories.contract";

export const SalespersonMasterCategoriesContract = {
  Response: t.Object({ ...SalespersonMasterCategoriesBase.fields }),
  Create: t.Object(
    t.Omit(t.Object(SalespersonMasterCategoriesBase.insertFields), [
      "id",
      "createdAt",
      "updatedAt",
    ]).properties
  ),
  Update: t.Partial(
    t.Omit(t.Object(SalespersonMasterCategoriesBase.insertFields), [
      "id",
      "createdAt",
      "updatedAt",
      "siteId",
    ])
  ),
  ListQuery: t.Object({
    ...t.Partial(t.Object(SalespersonMasterCategoriesBase.insertFields))
      .properties,
    ...PaginationParams.properties,
    ...SortParams.properties,
    search: t.Optional(t.String()),
  }),
  ListResponse: t.Object({
    data: t.Array(t.Object(SalespersonMasterCategoriesBase.fields)),
    total: t.Number(),
  }),
} as const;

export type SalespersonMasterCategoriesDTO = InferDTO<
  typeof SalespersonMasterCategoriesContract
>;
