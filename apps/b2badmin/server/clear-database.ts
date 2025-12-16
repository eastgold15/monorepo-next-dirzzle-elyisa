import { relations } from "@repo/contract";
import {
  accountTable,
  attributeTable,
  attributeTemplateTable,
  attributeValueTable,
  CustomerTable,
  dailyInquiryCounterTable,
  exportersTable,
  factoriesTable,
  heroCardsTable,
  // 基础数据
  MasterTable,
  // 媒体相关
  mediaMetadataTable,
  mediaTable,
  permissionTable,
  productMediaTable,
  productsTable,
  productTemplateTable,
  // Auth相关
  rolePermissionsTable,
  roleTable,
  salespersonsTable,
  sessionTable,
  siteCategoriesTable,
  siteConfigTable,
  siteProductsTable,
  sitesTable,
  // 按照依赖关系排序，先删除有外键依赖的表
  skusTable,
  translationDictTable,
  userSiteRolesTable,
  usersTable,
  verificationTable,
} from "@repo/contract/table";
import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle(
  "postgres://gina_user:gina_password@localhost:5432/gina_dev",
  { relations }
);
async function clearDatabase() {
  try {
    console.log("🧹 开始清空数据库...");

    // 清空所有表（按照依赖关系顺序）
    const tables = [
      // 先删除有外键依赖的表
      userSiteRolesTable,
      siteProductsTable,
      siteCategoriesTable,

      // SKU和商品相关
      skusTable,
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

      // 站点和配置
      sitesTable,
      siteConfigTable,
      heroCardsTable,

      // 其他数据
      CustomerTable,
      dailyInquiryCounterTable,
      translationDictTable,

      // Auth相关
      rolePermissionsTable,
      roleTable,
      permissionTable,
      accountTable,
      sessionTable,
      verificationTable,
      usersTable,

      // 基础数据
      MasterTable,

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
