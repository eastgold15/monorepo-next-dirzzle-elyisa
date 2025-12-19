import { t } from "elysia";
import { ProductsContract } from "../generated/products.contract";
// 1. 导入自动生成的原始契约
import { SkusContract as Generated } from "../generated/skus.contract";

// SKU 值的简单类型定义
const SkusValuesResponse = t.Object({
    id: t.String(),
    skuId: t.String(),
    attributeId: t.String(),
    value: t.String(),
    createdAt: t.Optional(t.Date()),
    updatedAt: t.Optional(t.Date()),
});

/**
 * 自定义扩展契约：SKU
 * 模式：继承基础字段 + 叠加复杂逻辑
 */

// --- A. 扩展响应结构 (最常用：增加关联数据) ---
const CustomResponse = t.Composite([
    Generated.Response, // 保持数据库字段同步
    t.Object({
        // 添加关联数据
        product: t.Optional(ProductsContract.Response),
        values: t.Optional(t.Array(SkusValuesResponse)),
        _extra: t.Optional(t.Any()), // 预留临时扩展位
    }),
]);

// --- B. 扩展创建请求 (增加前端特有的字段) ---
const CustomCreate = t.Composite([
    Generated.Create,
    t.Object({
        // 允许创建时同时提供属性值
        attributeValues: t.Optional(
            t.Array(
                t.Object({
                    attributeId: t.String(),
                    value: t.String(),
                })
            )
        ),
        // 允许指定产品
        productId: t.String(),
    }),
]);

// --- C. 扩展列表查询 ---
const CustomListQuery = t.Composite([
    Generated.ListQuery,
    t.Object({
        // 添加按产品筛选
        productId: t.Optional(t.String()),
        // 添加按属性值筛选
        attributes: t.Optional(
            t.Array(
                t.Object({
                    attributeId: t.String(),
                    value: t.String(),
                })
            )
        ),
    }),
]);

// --- D. 组装并导出 ---
export const SkusContract = {
    ...Generated, // 默认继承所有：Update, Patch
    Response: CustomResponse, // 覆盖为自定义详情响应
    Create: CustomCreate, // 覆盖为自定义创建请求
    ListQuery: CustomListQuery, // 覆盖为自定义列表查询
} as const;

// --- E. 导出 DTO 类型给前端使用 ---
export type SkusDTO = {
    Response: typeof SkusContract.Response.static;
    Create: typeof SkusContract.Create.static;
    Update: typeof Generated.Update.static; // 未修改的直接透传
    Patch: typeof Generated.Patch.static;
    ListQuery: typeof SkusContract.ListQuery.static;
    ListResponse: typeof Generated.ListResponse.static & {
        // 如果列表也需要扩展，可以在这里交叉类型
        data: Array<typeof SkusContract.Response.static>;
    };
};
