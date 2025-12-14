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
  userProfile: one(userProfilesTable, {
    fields: [usersTable.id],
    references: [userProfilesTable.userId],
  }),
  userRoles: many(userRolesTable, {
    relationName: "user_roles",
  }),
  userResourceRoles: many(userResourceRolesTable, {
    relationName: "user_resource_roles",
  }),
  accounts: many(accountTable),
  sessions: many(sessionTable),
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
export const userProfilesTable = pgTable("userprofile", {
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
export const userRolesTable = pgTable("user_roles", {
  id: idUuid,
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  roleId: uuid("role_id")
    .notNull()
    .references(() => roleTable.id, { onDelete: "cascade" }),
});

export const userRolesrelations = relations(userRolesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userRolesTable.userId],
    references: [usersTable.id],
    relationName: "user_roles", // 关键！必须和 usersRelations 中的 userRoles 关系名一致
  }),
  role: one(roleTable, {
    fields: [userRolesTable.roleId],
    references: [roleTable.id],
    // 可选：给 role 关系也命名，避免后续推断问题
    relationName: "user_roles_role",
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

export const permissionRelations = relations(
  permissionTable,
  ({ many, one }) => ({
    rolePermissions: one(rolePermissionsTable, {
      fields: [permissionTable.id],
      references: [rolePermissionsTable.roleId],
    }),
  })
);
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

export const rolePermissionRelations = relations(
  rolePermissionsTable,
  ({ many }) => ({
    permissions: many(permissionTable),
  })
);




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
    resourceId: uuid("resource_id").notNull(), // 存 factories.id 或 exporters.id

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


// 4. 用户资源角色表关系（同理，补全 relationName）
export const userResourceRolesRelations = relations(userResourceRolesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userResourceRolesTable.userId],
    references: [usersTable.id],
    relationName: "user_resource_roles", // 和 usersRelations 中的 userResourceRoles 一致
  }),
  role: one(roleTable, {
    fields: [userResourceRolesTable.roleId],
    references: [roleTable.id],
    relationName: "user_resource_roles_role", // 唯一命名
  }),
}));





// 更新 roleTable 的关系
export const roleRelations = relations(roleTable, ({ many }) => ({
  userRoles: many(userRolesTable, {
    relationName: "user_roles",
  }),
  rolePermissions: many(rolePermissionsTable, {
    relationName: "role_permissions",
  }),
  userResourceRoles: many(userResourceRolesTable, {
    relationName: "user_resource_roles",
  }),
}));
