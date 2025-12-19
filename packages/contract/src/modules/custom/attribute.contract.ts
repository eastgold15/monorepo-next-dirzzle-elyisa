import { t } from "elysia";
// 1. 导入自动生成的原始契约
import { AttributeContract as Generated } from "../generated/attribute.contract";

/**
 * 自定义扩展契约：Attribute
 * 模式：继承基础字段 + 叠加复杂逻辑
 */

// --- A. 扩展响应结构 (最常用：增加关联数据) ---
const CustomResponse = t.Composite([
    Generated.Response, // 保持数据库字段同步
    t.Object({
        // 添加关联数据
        values: t.Optional(t.Array(t.Object({
            id: t.String(),
            value: t.String(),
            sortOrder: t.Number(),
        }))),
        _extra: t.Optional(t.Any()), // 预留临时扩展位
    }),
]);

// --- B. 扩展创建请求 (增加前端特有的字段) ---
const CustomCreate = t.Composite([
    Generated.Create,
    t.Object({
        // 允许创建时同时提供属性值
        values: t.Optional(t.Array(t.String())),
    }),
]);

// --- C. 组装并导出 ---
export const AttributeContract = {
    ...Generated, // 默认继承所有：Update, Patch, ListQuery
    Response: CustomResponse, // 覆盖为自定义详情响应
    Create: CustomCreate, // 覆盖为自定义创建请求
} as const;

// --- D. 导出 DTO 类型给前端使用 ---
export type AttributeDTO = {
    Response: typeof AttributeContract.Response.static;
    Create: typeof AttributeContract.Create.static;
    Update: typeof Generated.Update.static; // 未修改的直接透传
    Patch: typeof Generated.Patch.static;
    ListQuery: typeof Generated.ListQuery.static;
    ListResponse: typeof Generated.ListResponse.static & {
        // 如果列表也需要扩展，可以在这里交叉类型
        data: Array<typeof AttributeContract.Response.static>;
    };
};