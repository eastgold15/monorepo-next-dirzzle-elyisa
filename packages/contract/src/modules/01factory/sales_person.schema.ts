/**
 * 工厂业务员表 - 只属于工厂的业务员
 * 业务员只能查看和管理自己工厂的信息
 */

import { relations } from "drizzle-orm";
import {
  boolean,
  pgTable,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "../01auth/auth.schema";
import { categoriesTable } from "../category/category.schema";
import { createdAt, idUuid, updatedAt } from "../helper/schemaHelper.schema";
import { factoriesTable } from "./factory.schema";

// 工厂业务员表
export const salespersonsTable = pgTable("salespersons", {
  id: idUuid,
  createdAt,
  updatedAt,

  // 关联统一用户体系
  userId: uuid("user_id")
    .notNull()
    .unique() // 一个用户只能是一个业务员（可选）
    .references(() => usersTable.id, { onDelete: "cascade" }),

  // 工厂关联
  factoryId: uuid("factory_id")
    .notNull()
    .references(() => factoriesTable.id, { onDelete: "cascade" }),
  // 业务属性（非权限！）
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  position: varchar("position", { length: 100 }),
  department: varchar("department", { length: 100 }),

  isActive: boolean("is_active").default(true).notNull(),
  avatar: varchar("avatar", { length: 500 }),

  lastAssignedAt: timestamp("last_assigned_at"),
});

// 业务员关系定义
export const salespersonRelations = relations(
  salespersonsTable,
  ({ one, many }) => ({
    factory: one(factoriesTable, {
      fields: [salespersonsTable.factoryId],
      references: [factoriesTable.id],
    }),
    user: one(usersTable, {
      fields: [salespersonsTable.userId],
      references: [usersTable.id],
    }),
    assignedCategories: many(salespersonCategoriesTable),
  })
);

export const salespersonCategoriesTable = pgTable(
  "salesperson_categories",
  {
    salespersonId: uuid("salesperson_id")
      .notNull()
      .references(() => salespersonsTable.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categoriesTable.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.salespersonId, t.categoryId] })]
);
export const salespersonCategoriesRelations = relations(
  salespersonCategoriesTable,
  ({ one }) => ({
    salesperson: one(salespersonsTable, {
      fields: [salespersonCategoriesTable.salespersonId],
      references: [salespersonsTable.id],
    }),
    category: one(categoriesTable, {
      fields: [salespersonCategoriesTable.categoryId],
      references: [categoriesTable.id],
    }),
  })
);
