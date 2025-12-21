//这是模板

import { t } from "elysia";
// 1. 导入自动生成的原始契约
import { UsersContract as Generated } from "../_generated/users.contract";

/**
 * 自定义扩展契约：Users
 * 模式：继承基础字段 + 叠加复杂逻辑
 */

// --- A. 扩展响应结构 (最常用：增加关联数据) ---
const CustomResponse = t.Composite([
  Generated.Response, // 保持数据库字段同步
]);

// --- B. 扩展创建请求 (例如：增加前端特有的校验) ---
const CustomCreate = t.Composite([
  Generated.Create,
  t.Object({
    password: t.String(),
    role: t.String(),
  }),
]);

// --- C. 组装并导出 ---
export const UsersContract = {
  ...Generated, // 默认继承所有：Update, Patch, ListQuery
  Response: CustomResponse, // 覆盖为自定义详情响应
  Create: CustomCreate, // 覆盖为自定义创建请求
} as const;

// --- D. 导出 DTO 类型给前端使用 ---
export type UsersDTO = {
  Response: typeof UsersContract.Response.static;
  Create: typeof UsersContract.Create.static;
  Update: typeof Generated.Update.static; // 未修改的直接透传
  Patch: typeof Generated.Patch.static;
  ListQuery: typeof Generated.ListQuery.static;
  ListResponse: typeof Generated.ListResponse.static & {
    // 如果列表也需要扩展，可以在这里交叉类型
  };
};
