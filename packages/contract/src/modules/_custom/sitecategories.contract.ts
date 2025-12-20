/**
 * 🤖 【Contract - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { t } from "elysia";
import type { TreeNode } from "~/helper/utils.types";
// 1. 导入自动生成的原始契约
import { SiteCategoriesContract as Generated } from "../_generated/sitecategories.contract";

// 1. 导入自动生成的原始契约
// import { XxxContract as Generated } from "../generated/xxx.contract";

// 2. 导入你可能需要关联的其他契约
// import { OtherContract } from "../generated/other.contract";

/**
 * 自定义扩展契约：${ModuleName}
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
    // 例如：增加“确认密码”或“验证码”这种数据库没有的字段
    // captcha: t.String(),
  }),
]);

// --- C. 组装并导出 ---
export const SiteCategoriesContract = {
  ...Generated, // 默认继承所有：Update, Patch, ListQuery
  Response: CustomResponse, // 覆盖为自定义详情响应
  Create: CustomCreate, // 覆盖为自定义创建请求
} as const;

// --- D. 导出 DTO 类型给前端使用 ---
export type SiteCategoriesContractDTO = {
  Response: typeof SiteCategoriesContract.Response.static;
  TreeResponse: TreeNode<typeof SiteCategoriesContract.Response.static>;
  Create: typeof SiteCategoriesContract.Create.static;
  Update: typeof Generated.Update.static; // 未修改的直接透传
  Patch: typeof Generated.Patch.static;
  ListQuery: typeof Generated.ListQuery.static;
  ListResponse: typeof Generated.ListResponse.static & {
    // 如果列表也需要扩展，可以在这里交叉类型
  };
};
