// 用户管理模块类型定义
// 供前后端共享使用

import { t } from "elysia";

// === 用户相关类型 ===

// 用户基础信息
export const UserEntity = t.Object({
  id: t.String(),
  name: t.String(),
  email: t.String(),
  phone: t.Optional(t.String()),
  position: t.Optional(t.String()),
  isActive: t.Boolean(),
  createdAt: t.String(),
  factoryName: t.Optional(t.String()),
  factoryId: t.Optional(t.String()),
  roleName: t.Union([
    t.Literal('exporter_admin'),
    t.Literal('factory_admin'),
    t.Literal('salesperson')
  ]),
});

// 用户列表响应
export const UserListResponse = t.Object({
  users: t.Array(UserEntity),
  pagination: t.Object({
    page: t.Number(),
    limit: t.Number(),
    total: t.Number(),
    totalPages: t.Number(),
  }),
});

// 用户查询参数
export const UserListParams = t.Object({
  page: t.Optional(t.Number()),
  limit: t.Optional(t.Number()),
  search: t.Optional(t.String()),
  role: t.Optional(t.String()),
});

// 创建业务员请求数据
export const CreateSalespersonRequest = t.Object({
  name: t.String({ minLength: 2, maxLength: 100 }),
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 6, maxLength: 50 }),
  phone: t.Optional(t.String({ minLength: 10, maxLength: 20 })),
  position: t.Optional(t.String({ minLength: 2, maxLength: 100 })),
  factoryId: t.String({ format: "uuid" }),
});

// 更新用户状态请求数据
export const UpdateUserStatusRequest = t.Object({
  isActive: t.Boolean(),
});

// 更新用户信息请求数据
export const UpdateUserRequest = t.Object({
  name: t.Optional(t.String()),
  phone: t.Optional(t.String()),
  position: t.Optional(t.String()),
  factoryId: t.Optional(t.String()),
});

// === 工厂相关类型 ===

// 工厂实体
export const FactoryEntity = t.Object({
  id: t.String(),
  name: t.String(),
  code: t.String(),
  address: t.String(),
});

// === API响应类型 ===

// 统一API响应格式
export const ApiResponse = t.Object({
  data: t.Unknown(),
  message: t.String(),
  code: t.Number(),
});

// 成功响应
export const SuccessResponse = t.Object({
  data: t.Unknown(),
  message: t.String(),
  code: t.Literal(200),
});

// 错误响应
export const ErrorResponse = t.Object({
  data: t.Null(),
  message: t.String(),
  code: t.Number(),
});

// === 运行时 Schema 集合（值）===
export const UserTModel = {
  UserEntity,
  UserListResponse,
  UserListParams,
  CreateSalespersonRequest,
  UpdateUserStatusRequest,
  UpdateUserRequest,
  FactoryEntity,
  ApiResponse,
  SuccessResponse,
  ErrorResponse,
} as const;

// === 编译时类型导出 ===

export type User = typeof UserEntity.static;
export type UserList = typeof UserListResponse.static;
export type UserListQuery = typeof UserListParams.static;
export type CreateSalespersonData = typeof CreateSalespersonRequest.static;
export type UpdateUserStatusData = typeof UpdateUserStatusRequest.static;
export type UpdateUserData = typeof UpdateUserRequest.static;
export type Factory = typeof FactoryEntity.static;
export type ApiSuccessResponse = typeof SuccessResponse.static;
export type ApiErrorResponse = typeof ErrorResponse.static;