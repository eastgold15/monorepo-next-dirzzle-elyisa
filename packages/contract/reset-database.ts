import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle("postgres://gina_user:gina_password@localhost:5432/gina_dev");

async function resetDatabase() {
  console.log("🗑️ 开始重置数据库...");

  try {
    // 获取所有表名
    const tablesResult = await db.execute(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `);

    console.log('tablesResult:', tablesResult)
    const tables = tablesResult.rows.map(row => row.tablename);
    console.log("发现的表:", tables);

    // 先禁用所有外键约束
    await db.execute(`
      SET session_replication_role = replica;
    `);

    // 删除所有表
    for (const table of tables) {
      try {
        await db.execute(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
        console.log(`✅ 已删除表: ${table}`);
      } catch (error) {
        console.log(`⚠️ 删除表 ${table} 失败:`, JSON.stringify(error));
      }
    }

    // 重新启用外键约束
    await db.execute(`
      SET session_replication_role = DEFAULT;
    `);

    console.log("✅ 数据库重置完成！");
  } catch (error) {
    console.error("❌ 重置数据库失败:", error);
    throw error;
  }
}

resetDatabase().then(() => {
  console.log("🎉 数据库重置成功！");
  process.exit(0);
}).catch(error => {
  console.error("💥 重置失败:", error);
  process.exit(1);
});