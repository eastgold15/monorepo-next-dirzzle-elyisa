// Auth module contract - 自定义扩展
// 用于用户认证和权限管理

import { t } from "elysia";
// 1. 导入自动生成的原始契约
import { UsersContract as Generated } from "../_generated/users.contract";

// 2. 导入你可能需要关联的其他契约
// import { RoleContract } from "../generated/role.contract";
// import { PermissionContract } from "../generated/permission.contract";

/**
 * 自定义扩展契约：Auth
 * 模式：继承基础字段 + 叠加复杂逻辑
 */

// --- A. 扩展响应结构 (最常用：增加关联数据) ---
const CustomResponse = t.Composite([
  Generated.Response, // 保持数据库字段同步
  t.Object({
    // 在这里添加关联字段，例如：
    // role: t.Optional(RoleContract.Response),
    // permissions: t.Array(t.String()),
    // lastLoginAt: t.Optional(t.String()),
    // loginCount: t.Optional(t.Number()),
    // profilePicture: t.Optional(t.String()),
    // 示例：临时扩展字段
    name: t.Optional(t.Any()),
  }),
]);

// --- B. 扩展创建请求 (例如：增加前端特有的校验) ---
const CustomCreate = t.Composite([
  Generated.Create,
  t.Object({
    // 例如：增加"确认密码"这种数据库没有的字段
    confirmPassword: t.String(),
    // captcha: t.String(),
    // agreeToTerms: t.Boolean(),
  }),
]);

// --- C. 自定义业务类型 ---
// 登录请求
const LoginRequest = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 6 }),
  // captcha: t.Optional(t.String()),
  // rememberMe: t.Optional(t.Boolean()),
});

// 注册请求
const RegisterRequest = t.Object({
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 6 }),
  confirmPassword: t.String(),
  name: t.String({ minLength: 2 }),
  // acceptTerms: t.Boolean(),
});

// 修改密码
const ChangePasswordRequest = t.Object({
  currentPassword: t.String(),
  newPassword: t.String({ minLength: 6 }),
  confirmPassword: t.String(),
});

// 权限查询
const PermissionsQuery = t.Object({
  userId: t.Optional(t.String()),
  roleId: t.Optional(t.String()),
  resource: t.Optional(t.String()),
  action: t.Optional(t.String()),
});

// 用户状态更新
const UserStatusUpdate = t.Object({
  userId: t.String(),
  isActive: t.Boolean(),
  // reason: t.Optional(t.String()),
});

// --- D. 组装并导出 ---
export const AuthContract = {
  ...Generated, // 默认继承所有：Update, Patch, ListQuery
  Response: CustomResponse, // 覆盖为自定义详情响应
  Create: CustomCreate, // 覆盖为自定义创建请求

  // 自定义业务类型
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  PermissionsQuery,
  UserStatusUpdate,
} as const;

// --- E. 导出 DTO 类型给前端使用 ---
export type AuthDTO = {
  Response: typeof AuthContract.Response.static;
  Create: typeof AuthContract.Create.static;
  Update: typeof Generated.Update.static; // 未修改的直接透传
  Patch: typeof Generated.Patch.static;
  ListQuery: typeof Generated.ListQuery.static;
  ListResponse: typeof Generated.ListResponse.static & {
    // 如果列表也需要扩展，可以在这里交叉类型
  };

  // 自定义类型
  LoginRequest: typeof AuthContract.LoginRequest.static;
  RegisterRequest: typeof AuthContract.RegisterRequest.static;
  ChangePasswordRequest: typeof AuthContract.ChangePasswordRequest.static;
  PermissionsQuery: typeof AuthContract.PermissionsQuery.static;
  UserStatusUpdate: typeof AuthContract.UserStatusUpdate.static;
};