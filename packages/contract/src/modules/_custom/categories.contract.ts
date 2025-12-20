// Categories module contract - 自定义扩展
// 用于分类管理

import { t } from "elysia";
import { ProductMasterCategoriesContract as GeneratedProduct } from "../_generated/productmastercategories.contract";
// 1. 导入自动生成的原始契约
import { SiteCategoriesContract as GeneratedSite } from "../_generated/sitecategories.contract";

/**
 * 自定义扩展契约：Categories
 * 模式：继承基础字段 + 叠加复杂逻辑
 */

// --- 站点分类 ---
const SiteCategoryResponse = t.Composite([
  GeneratedSite.Response,
  t.Object({
    // 在这里添加关联字段，例如：
    // parent: t.Optional(GeneratedSite.Response),
    // children: t.Array(GeneratedSite.Response),
    // productCount: t.Number(),
    // siteId: t.String(),
    // level: t.Number(),
    // path: t.Array(t.String()),
    // isActive: t.Boolean(),
    // sortOrder: t.Number(),
  }),
]);

const SiteCategoryCreate = t.Composite([
  GeneratedSite.Create,
  t.Object({
    // parentId: t.Optional(t.String()),
    // sortOrder: t.Optional(t.Number()),
    // isActive: t.Optional(t.Boolean()),
    // description: t.Optional(t.String()),
    // icon: t.Optional(t.String()),
    // banner: t.Optional(t.String()),
  }),
]);

const SiteCategoryQuery = t.Object({
  siteId: t.Optional(t.String()),
  parentId: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
  hasProducts: t.Optional(t.Boolean()),
  level: t.Optional(t.Number()),
  search: t.Optional(t.String()),
  sortBy: t.Optional(
    t.UnionEnum(["sortOrder", "name", "createdAt", "productCount"])
  ),
  sortOrder: t.Optional(t.UnionEnum(["asc", "desc"])),
});

// 批量更新分类排序
const SiteCategorySortUpdate = t.Object({
  siteId: t.String(),
  categories: t.Array(
    t.Object({
      id: t.String(),
      sortOrder: t.Number(),
      parentId: t.Optional(t.String()),
    })
  ),
});

// --- 产品主分类 ---
const ProductCategoryResponse = t.Composite([
  GeneratedProduct.Response,
  t.Object({
    // 在这里添加关联字段，例如：
    // parent: t.Optional(GeneratedProduct.Response),
    // children: t.Array(GeneratedProduct.Response),
    // productCount: t.Number(),
    // level: t.Number(),
    // path: t.Array(t.String()),
    // attributes: t.Array(AttributeContract.Response),
    // template: t.Optional(AttributeTemplateContract.Response),
    // image: t.Optional(t.String()),
    // isActive: t.Boolean(),
    // sortOrder: t.Number(),
  }),
]);

const ProductCategoryCreate = t.Composite([
  GeneratedProduct.Create,
  t.Object({
    // parentId: t.Optional(t.String()),
    // attributeTemplateId: t.Optional(t.String()),
    // image: t.Optional(t.String()),
    // icon: t.Optional(t.String()),
    // description: t.Optional(t.String()),
    // sortOrder: t.Optional(t.Number()),
    // isActive: t.Optional(t.Boolean()),
    // specifications: t.Optional(t.Object({}, { additionalProperties: true })),
  }),
]);

const ProductCategoryQuery = t.Object({
  parentId: t.Optional(t.String()),
  level: t.Optional(t.Number()),
  hasProducts: t.Optional(t.Boolean()),
  hasTemplate: t.Optional(t.Boolean()),
  isActive: t.Optional(t.Boolean()),
  search: t.Optional(t.String()),
  sortBy: t.Optional(
    t.UnionEnum(["sortOrder", "name", "createdAt", "productCount"])
  ),
  sortOrder: t.Optional(t.UnionEnum(["asc", "desc"])),
});

// 分类树结构
const CategoryTree = t.Object({
  id: t.String(),
  name: t.String(),
  code: t.Optional(t.String()),
  level: t.Number(),
  parentId: t.Optional(t.String()),
  children: t.Array(t.Any()), // 递归类型
  productCount: t.Number(),
  isActive: t.Boolean(),
  sortOrder: t.Number(),
});

// --- D. 组装并导出 ---
export const SiteCategoriesContract = {
  ...GeneratedSite,
  Response: SiteCategoryResponse,
  Create: SiteCategoryCreate,
  ListQuery: SiteCategoryQuery,
  SortUpdate: SiteCategorySortUpdate,
  Tree: CategoryTree,
} as const;

export const ProductMasterCategoriesContract = {
  ...GeneratedProduct,
  Response: ProductCategoryResponse,
  Create: ProductCategoryCreate,
  ListQuery: ProductCategoryQuery,
  Tree: CategoryTree,
} as const;

// --- E. 导出 DTO 类型给前端使用 ---
export type SiteCategoriesDTO = {
  Response: typeof SiteCategoriesContract.Response.static;
  Create: typeof SiteCategoriesContract.Create.static;
  Update: typeof GeneratedSite.Update.static;
  Patch: typeof GeneratedSite.Patch.static;
  ListQuery: typeof SiteCategoriesContract.ListQuery.static;
  ListResponse: typeof GeneratedSite.ListResponse.static;
  SortUpdate: typeof SiteCategoriesContract.SortUpdate.static;
  Tree: typeof SiteCategoriesContract.Tree.static;
};

export type ProductMasterCategoriesDTO = {
  Response: typeof ProductMasterCategoriesContract.Response.static;
  Create: typeof ProductMasterCategoriesContract.Create.static;
  Update: typeof GeneratedProduct.Update.static;
  Patch: typeof GeneratedProduct.Patch.static;
  ListQuery: typeof ProductMasterCategoriesContract.ListQuery.static;
  ListResponse: typeof GeneratedProduct.ListResponse.static;
  Tree: typeof ProductMasterCategoriesContract.Tree.static;
};
