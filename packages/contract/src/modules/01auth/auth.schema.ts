// BetterAuth 用户表定义

import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";

/**
 * BetterAuth 用户表定义
 */
export const usersTable = pgTable("user_table", {
  id: idUuid,
  createdAt,
  updatedAt,
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
});

export const usersRelations = relations(usersTable, ({ one, many }) => ({
  userprofile: one(userprofileTable, {
    fields: [usersTable.id],
    references: [userprofileTable.userId],
  }),
  userRoles: many(userRoleTable, {
    relationName: "user_roles",
  }),
}));

/**
 * BetterAuth 账户表定义
 */
export const accountTable = pgTable("account", {
  id: idUuid,
  createdAt,
  updatedAt,
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
});

/**
 * BetterAuth 会话表定义
 */
export const sessionTable = pgTable("session", {
  id: idUuid,
  createdAt,
  updatedAt,
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

/**
 * BetterAuth 验证表定义
 */
export const verificationTable = pgTable("verification", {
  id: idUuid,
  createdAt,
  updatedAt,
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

// userprofile 表定义·
export const userprofileTable = pgTable("userprofile", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
});

// 用户角色表
export const roleTable = pgTable("roles", {
  id: idUuid,
  name: text("name").notNull().unique(),
  description: text("description"),
});
// 用户角色关联表
export const userRoleTable = pgTable("user_roles", {
  id: idUuid,
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  roleId: uuid("role_id")
    .notNull()
    .references(() => roleTable.id, { onDelete: "cascade" }),
});

export const userRolesrelations = relations(userRoleTable, ({ one }) => ({
  role: one(roleTable, {
    fields: [userRoleTable.roleId],
    references: [roleTable.id],
  }),
}));

// 用户权限表
export const permissionTable = pgTable("permissions", {
  id: idUuid,
  createdAt,
  updatedAt,
  name: text("name").notNull(),
  description: text("description"),
});

export const permissionRelations = relations(permissionTable, ({ many, one }) => ({
  rolePermissions: one(rolePermissionsTable, {
    fields: [permissionTable.id],
    references: [rolePermissionsTable.roleId],
  })
}));
//  用户角色权限关联表
export const rolePermissionsTable = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roleTable.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissionTable.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })]
);


export const rolePermissionRelations = relations(rolePermissionsTable, ({ many }) => ({
  permissions: many(permissionTable),
}));

export const userResourceRolesTable = pgTable(
  "user_resource_roles",
  {
    id: idUuid,
    createdAt,
    updatedAt,
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    roleId: uuid("role_id")
      .notNull()
      .references(() => roleTable.id, { onDelete: "cascade" }),

    resourceType: text("resource_type").notNull(), // 'factory' | 'exporter'
    resourceId: text("resource_id").notNull(), // 存 factories.id 或 exporters.id（都转成 text）

    isPrimary: boolean("is_primary").default(false),
  },
  (t) => [
    unique("uniqueUserResourceRole").on(
      t.userId,
      t.resourceType,
      t.resourceId,
      t.roleId
    ),
  ]
);
