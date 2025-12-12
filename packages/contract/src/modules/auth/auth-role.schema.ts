/**
 * 用户角色关联表 Schema
 * 用于定义用户与出口商、工厂、业务员之间的关系和权限
 */

import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";
import { exportersTable } from "../01exporter/exporter.schema";
import { factoriesTable } from "../01factory/factory.schema";
import { salespersonsTable } from "../01factory/sales_person.schema";
import { usersTable } from "./auth.schema";

// 用户-出口商关联表
export const userExportersTable = pgTable("user_exporters", {
  id: idUuid,
  createdAt,
  updatedAt,

  // 关联用户
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  // 关联出口商
  exporterId: uuid("exporter_id")
    .notNull()
    .references(() => exportersTable.id, { onDelete: "cascade" }),

  // 角色和权限
  role: varchar("role", { length: 50 }).notNull(), // admin, member
  isActive: boolean("is_active").default(true).notNull(),

  // 是否为主要关联（一个用户可以有多个出口商，但只有一个主要出口商）
  isPrimary: boolean("is_primary").default(false).notNull(),
});

// 用户-工厂关联表
export const userFactoriesTable = pgTable("user_factories", {
  id: idUuid,
  createdAt,
  updatedAt,

  // 关联用户
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  // 关联工厂
  factoryId: uuid("factory_id")
    .notNull()
    .references(() => factoriesTable.id, { onDelete: "cascade" }),

  // 角色和权限
  role: varchar("role", { length: 50 }).notNull(), // admin, member
  isActive: boolean("is_active").default(true).notNull(),

  // 是否为主要关联（一个用户可以有多个工厂，但只有一个主要工厂）
  isPrimary: boolean("is_primary").default(false).notNull(),
});

// 关系定义
export const userExporterRelations = relations(userExportersTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userExportersTable.userId],
    references: [usersTable.id],
  }),
  exporter: one(exportersTable, {
    fields: [userExportersTable.exporterId],
    references: [exportersTable.id],
  }),
}));

export const userFactoryRelations = relations(userFactoriesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userFactoriesTable.userId],
    references: [usersTable.id],
  }),
  factory: one(factoriesTable, {
    fields: [userFactoriesTable.factoryId],
    references: [factoriesTable.id],
  }),
}));