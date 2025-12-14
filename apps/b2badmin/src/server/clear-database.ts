import {
  accountTable,
  attributeTable,
  attributeTemplateTable,
  attributeValueTable,
  CustomerTable,
  // 基础数据
  categoriesTable,
  exportersTable,
  factoriesTable,
  heroCardsTable,
  // 媒体相关
  mediaMetadataTable,
  mediaTable,
  permissionTable,
  productCategoriesTable,
  productMediaTable,
  productsTable,
  productTemplateTable,
  // Auth相关
  rolePermissionsTable,
  roleTable,
  // 业务数据
  salespersonsTable,
  sessionTable,
  siteConfigTable,
  // 按照依赖关系排序，先删除有外键依赖的表
  skusTable,
  systemConfigTable,
  userResourceRolesTable,
  userRolesTable,
  usersTable,
  verificationTable,
} from "@repo/contract/table";
import { db } from "./db/connection";

async function clearDatabase() {
  try {
    console.log("🧹 开始清空数据库...");

    // 清空所有表（按照依赖关系顺序）
    const tables = [
      // SKU和商品相关
      skusTable,
      productCategoriesTable,
      productMediaTable,
      productTemplateTable,
      productsTable,
      attributeValueTable,
      attributeTable,
      attributeTemplateTable,

      // 业务数据
      salespersonsTable,
      factoriesTable,
      exportersTable,

      // Auth相关
      rolePermissionsTable,
      userResourceRolesTable,
      userRolesTable,
      accountTable,
      sessionTable,
      verificationTable,
      usersTable,
      roleTable,
      permissionTable,

      // 基础数据
      categoriesTable,
      CustomerTable,
      heroCardsTable,
      siteConfigTable,
      systemConfigTable,

      // 媒体相关
      mediaMetadataTable,
      mediaTable,
    ];

    for (const table of tables) {
      try {
        await db.delete(table);
        console.log("✓ 清空表成功");
      } catch (error) {
        console.log("⚠️ 跳过表 (可能不存在):", error);
      }
    }

    console.log("✅ 数据库清空完成！");
  } catch (error) {
    console.error("❌ 清空数据库失败:", error);
    process.exit(1);
  }
}

// 运行清空
clearDatabase();
