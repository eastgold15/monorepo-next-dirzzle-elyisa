// 用户管理相关类型定义

import { t } from "elysia";

// 创建业务员请求
const CreateSalespersonRequest = t.Object({
  name: t.String({
    description: "业务员姓名",
  }),
  email: t.String({
    format: "email",
    description: "业务员邮箱",
  }),
  password: t.String({
    minLength: 6,
    description: "登录密码",
  }),
  phone: t.Optional(t.String({
    description: "联系电话",
  })),
  position: t.Optional(t.String({
    description: "职位",
  })),
  factoryId: t.String({
    description: "所属工厂ID",
  }),
});

// 更新用户状态请求
const UpdateUserStatusRequest = t.Object({
  isActive: t.Boolean({
    description: "用户状态",
  }),
});

// 用户列表查询参数
const UserListQuery = t.Object({
  page: t.Optional(t.Numeric({
    default: 1,
    description: "页码",
  })),
  limit: t.Optional(t.Numeric({
    default: 20,
    description: "每页数量",
  })),
  search: t.Optional(t.String({
    description: "搜索关键词（姓名或邮箱）",
  })),
  role: t.Optional(t.Union([
    t.Literal("exporter_admin"),
    t.Literal("factory_admin"),
    t.Literal("salesperson"),
  ])),
  isActive: t.Optional(t.Boolean({
    description: "用户状态筛选",
  })),
  factoryId: t.Optional(t.String({
    description: "工厂ID筛选",
  })),
});

// 用户列表响应
const UserListItem = t.Object({
  id: t.String(),
  name: t.String(),
  email: t.String(),
  phone: t.Optional(t.Union([t.String(), t.Null()])),
  position: t.String(),
  isActive: t.Boolean(),
  roleName: t.String(),
  factoryName: t.Optional(t.Union([t.String(), t.Null()])),
  factoryId: t.Optional(t.Union([t.String(), t.Null()])),
  createdAt: t.String(),
});

const UserListResponse = t.Object({
  users: t.Array(UserListItem),
  pagination: t.Object({
    page: t.Number(),
    limit: t.Number(),
    total: t.Number(),
    totalPages: t.Number(),
  }),
});

// 工厂信息（简化版）
const FactoryInfo = t.Object({
  id: t.String(),
  name: t.String(),
  code: t.String(),
  description: t.Optional(t.Union([t.String(), t.Null()])),
  isActive: t.Boolean(),
});

// 创建业务员响应
const CreateSalespersonResponse = t.Object({
  id: t.String(),
  name: t.String(),
  email: t.String(),
  role: t.Literal("salesperson"),
  factoryId: t.String(),
  factoryName: t.String(),
});

// === 运行时 Schema 集合 ===
export const UserManagementTModel = {
  CreateSalespersonRequest,
  UpdateUserStatusRequest,
  UserListQuery,
  UserListItem,
  UserListResponse,
  FactoryInfo,
  CreateSalespersonResponse,
} as const;

// === 编译时类型集合 ===
export type UserManagementTModel = {
  CreateSalespersonRequest: typeof CreateSalespersonRequest.static;
  UpdateUserStatusRequest: typeof UpdateUserStatusRequest.static;
  UserListQuery: typeof UserListQuery.static;
  UserListItem: typeof UserListItem.static;
  UserListResponse: typeof UserListResponse.static;
  FactoryInfo: typeof FactoryInfo.static;
  CreateSalespersonResponse: typeof CreateSalespersonResponse.static;
};