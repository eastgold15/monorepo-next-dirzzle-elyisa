// Products module contract - 自定义扩展
// 用于产品管理

import { t } from "elysia";
// 1. 导入自动生成的原始契约
import { ProductsContract as Generated } from "../_generated/products.contract";
import { SkusContract } from "../_generated/skus.contract";
import { ProductmediaContract } from "../_generated/productmedia.contract";
import { AttributeContract } from "../_generated/attribute.contract";

/**
 * 自定义扩展契约：Products
 * 模式：继承基础字段 + 叠加复杂逻辑
 */

// --- A. 扩展响应结构 (最常用：增加关联数据) ---
const CustomResponse = t.Composite([
  Generated.Response, // 保持数据库字段同步
  t.Object({
    // 在这里添加关联字段，例如：
    // skus: t.Array(SkusContract.Response),
    // medias: t.Array(ProductmediaContract.Response),
    // attributes: t.Array(AttributeContract.Response),
    // category: t.Optional(CategoryContract.Response),
    // template: t.Optional(ProducttemplateContract.Response),
    // totalStock: t.Number(),
    // minPrice: t.Number(),
    // maxPrice: t.Number(),
    // averageRating: t.Number(),
    // reviewCount: t.Number(),
    // salesCount: t.Number(),
    // isFavorite: t.Boolean(),
    // tags: t.Array(t.String()),
    // specifications: t.Object({}, { additionalProperties: true }),
  }),
]);

// --- B. 扩展创建请求 (例如：增加前端特有的校验) ---
const CustomCreate = t.Composite([
  Generated.Create,
  t.Object({
    // 例如：增加"产品标签"和"规格参数"这些额外的业务字段
    tags: t.Optional(t.Array(t.String())),
    specifications: t.Optional(t.Object({}, { additionalProperties: true })),
    // seoKeywords: t.Optional(t.Array(t.String())),
    // seoDescription: t.Optional(t.String()),
    // relatedProductIds: t.Optional(t.Array(t.String())),
  }),
]);

// --- C. 自定义业务类型 ---
// 产品查询参数
const ProductQuery = t.Object({
  categoryId: t.Optional(t.String()),
  factoryId: t.Optional(t.String()),
  status: t.Optional(t.Union([
    t.Literal("draft"),
    t.Literal("active"),
    t.Literal("inactive"),
    t.Literal("archived"),
  ])),
  priceRange: t.Optional(t.Object({
    min: t.Number({ minimum: 0 }),
    max: t.Number({ minimum: 0 }),
  })),
  stockRange: t.Optional(t.Object({
    min: t.Number({ minimum: 0 }),
    max: t.Number({ minimum: 0 }),
  })),
  attributes: t.Optional(t.Array(t.Object({
    attributeId: t.String(),
    value: t.Union([t.String(), t.Number(), t.Boolean()]),
  }))),
  tags: t.Optional(t.Array(t.String())),
  search: t.Optional(t.String()),
  sortBy: t.Optional(t.Union([
    t.Literal("createdAt"),
    t.Literal("updatedAt"),
    t.Literal("name"),
    t.Literal("price"),
    t.Literal("stock"),
    t.Literal("sales"),
    t.Literal("rating"),
  ])),
  sortOrder: t.Optional(t.Union([t.Literal("asc"), t.Literal("desc")])),
  hasImages: t.Optional(t.Boolean()),
  hasSkus: t.Optional(t.Boolean()),
});

// 产品克隆请求
const CloneProductRequest = t.Object({
  productId: t.String(),
  newName: t.String(),
  includeSkus: t.Boolean(),
  includeImages: t.Boolean(),
  includeAttributes: t.Boolean(),
});

// 产品批量操作
const BatchProductOperation = t.Object({
  productIds: t.Array(t.String({ minimum: 1 })),
  operation: t.Union([
    t.Literal("activate"),
    t.Literal("deactivate"),
    t.Literal("archive"),
    t.Literal("delete"),
  ]),
  // reason: t.Optional(t.String()),
});

// 产品导入
const ImportProductsRequest = t.Object({
  format: t.Union([t.Literal("csv"), t.Literal("json"), t.Literal("excel")]),
  data: t.Union([
    t.String(),
    t.Array(t.Object({}, { additionalProperties: true })),
  ]),
  options: t.Object({
    skipDuplicates: t.Boolean(),
    updateExisting: t.Boolean(),
    validateOnly: t.Boolean(),
  }),
});

// 产品导出
const ExportProductsRequest = t.Object({
  format: t.Union([t.Literal("csv"), t.Literal("json"), t.Literal("excel")]),
  filters: t.Optional(ProductQuery),
  fields: t.Optional(t.Array(t.String())),
  includeRelations: t.Optional(t.Boolean()),
});

// 产品统计
const ProductStats = t.Object({
  totalCount: t.Number(),
  activeCount: t.Number(),
  draftCount: t.Number(),
  archivedCount: t.Number(),
  totalStock: t.Number(),
  lowStockCount: t.Number(),
  outOfStockCount: t.Number(),
  categoryStats: t.Array(t.Object({
    categoryId: t.String(),
    categoryName: t.String(),
    count: t.Number(),
  })),
  priceStats: t.Object({
    min: t.Number(),
    max: t.Number(),
    average: t.Number(),
  }),
  recentSales: t.Number(),
  topProducts: t.Array(t.Object({
    productId: t.String(),
    name: t.String(),
    sales: t.Number(),
    revenue: t.Number(),
  })),
});

// --- D. 组装并导出 ---
export const ProductsContract = {
  ...Generated, // 默认继承所有：Update, Patch, ListQuery
  Response: CustomResponse, // 覆盖为自定义详情响应
  Create: CustomCreate, // 覆盖为自定义创建请求
  ListQuery: ProductQuery, // 覆盖为自定义查询

  // 自定义业务类型
  ProductQuery,
  CloneProductRequest,
  BatchProductOperation,
  ImportProductsRequest,
  ExportProductsRequest,
  ProductStats,
} as const;

// --- E. 导出 DTO 类型给前端使用 ---
export type ProductsDTO = {
  Response: typeof ProductsContract.Response.static;
  Create: typeof ProductsContract.Create.static;
  Update: typeof Generated.Update.static; // 未修改的直接透传
  Patch: typeof Generated.Patch.static;
  ListQuery: typeof ProductsContract.ListQuery.static;
  ListResponse: typeof Generated.ListResponse.static & {
    // 如果列表也需要扩展，可以在这里交叉类型
  };

  // 自定义类型
  ProductQuery: typeof ProductsContract.ProductQuery.static;
  CloneProductRequest: typeof ProductsContract.CloneProductRequest.static;
  BatchProductOperation: typeof ProductsContract.BatchProductOperation.static;
  ImportProductsRequest: typeof ProductsContract.ImportProductsRequest.static;
  ExportProductsRequest: typeof ProductsContract.ExportProductsRequest.static;
  ProductStats: typeof ProductsContract.ProductStats.static;
};