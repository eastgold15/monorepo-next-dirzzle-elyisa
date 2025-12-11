import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";
import { PaginationParams, SortParams } from "../helper/query-types";
import { usersTable } from "./auth.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(usersTable);
const Update = createUpdateSchema(usersTable);
const Select = createSelectSchema(usersTable);

// === 业务 Schema ===
const Create = Insert.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const Patch = Update.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  password: true, // 通过专门的接口修改密码
}).partial();

const BusinessQuery = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  isActive: z.boolean().optional(),
});

const ListQuery = BusinessQuery.extend(PaginationParams.shape).extend(
  SortParams.shape
);

const Login = z.object({
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(1, "密码不能为空"),
});

const ChangePassword = z.object({
  oldPassword: z.string().min(1, "原密码不能为空"),
  newPassword: z.string().min(6, "新密码至少6个字符"),
});

const Entity = Select;

// === 1. 运行时 Schema 集合（值）===
export const AuthModel = {
  Insert,
  Update,
  Select,
  Create,
  Patch,
  ListQuery,
  Login,
  ChangePassword,
  Entity,
  BusinessQuery,
} as const;

// === 2. 编译时类型集合（类型）===
export type AuthModel = {
  Insert: z.infer<typeof Insert>;
  Update: z.infer<typeof Update>;
  Select: z.infer<typeof Select>;
  Create: z.infer<typeof Create>;
  Patch: z.infer<typeof Patch>;
  ListQuery: z.infer<typeof ListQuery>;
  Login: z.infer<typeof Login>;
  ChangePassword: z.infer<typeof ChangePassword>;
  Entity: z.infer<typeof Entity>;
  BusinessQuery: z.infer<typeof BusinessQuery>;
};
