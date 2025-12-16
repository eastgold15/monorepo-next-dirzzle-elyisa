 3. xxx.schema.ts 文件规范

  作用：定义数据库表结构和关系
  关键要素：

  // module_name.schema.ts

  // 1. 导入通用字段
  import { createdAt, id, updatedAt } from "~/lib/db/schemaHelper";
  import { relations } from "drizzle-orm";
  import { pgTable, varchar, integer, boolean } from "drizzle-orm/pg-core";

  // 2. 主表定义
  export const moduleNameTable = pgTable("table_name", {
    id,                    // 来自 schemaHelper
    createdAt,             // 来自 schemaHelper
    updatedAt,             // 来自 schemaHelper
    // 其他业务字段...
  });

  // 3. 关系定义
  export const moduleNameRelations = relations(moduleNameTable, ({ one, many }) => ({
    // 关联关系定义
  }));

  命名规范：
  - 表名：moduleNameTable
  - 关系名：moduleNameRelations
