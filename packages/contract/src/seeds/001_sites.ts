import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  exportersTable,
  factoriesTable,
  productsTable,
  siteCategoriesTable,
  siteProductsTable,
  sitesTable,
  userSitePermissionsTable,
  usersTable,
} from "../table.schema";

export async function seedSites() {
  console.log("开始播种站点数据...");

  // 1. 获取现有的工厂和出口商
  const factories = await db.select().from(factoriesTable).limit(3);
  const exporters = await db.select().from(exportersTable).limit(3);
  const users = await db.select().from(usersTable).limit(5);

  if (factories.length === 0 || exporters.length === 0) {
    console.log("警告: 没有找到工厂或出口商数据，请先播种基础数据");
    return;
  }

  // 2. 创建工厂站点
  const factorySites = [];
  for (const factory of factories) {
    const [site] = await db
      .insert(sitesTable)
      .values({
        name: `${factory.name} 官方网站`,
        domain: `${factory.code.toLowerCase()}.example.com`,
        site_type: "factory",
        entity_id: factory.id,
        theme_config: {
          primaryColor: "#3B82F6",
          secondaryColor: "#10B981",
          logo: `/logos/${factory.code}.png`,
          favicon: `/favicons/${factory.code}.ico`,
        },
        feature_config: {
          enableInquiry: true,
          enableQuotation: true,
          showContactInfo: true,
          showFactoryDetails: true,
        },
        is_active: true,
      })
      .returning();
    factorySites.push(site);
    console.log(`创建工厂站点: ${site.name}`);
  }

  // 3. 创建出口商站点
  const exporterSites = [];
  for (const exporter of exporters) {
    const [site] = await db
      .insert(sitesTable)
      .values({
        name: `${exporter.name} B2B平台`,
        domain: `${exporter.code.toLowerCase()}.example.com`,
        site_type: "exporter",
        entity_id: exporter.id,
        theme_config: {
          primaryColor: "#1F2937",
          secondaryColor: "#DC2626",
          logo: `/logos/${exporter.code}.png`,
          favicon: `/favicons/${exporter.code}.ico`,
        },
        feature_config: {
          enableInquiry: true,
          enableQuotation: true,
          showContactInfo: true,
          showFactoryList: true,
          enableMultiLanguage: true,
        },
        is_active: true,
      })
      .returning();
    exporterSites.push(site);
    console.log(`创建出口商站点: ${site.name}`);
  }

  // 4. 为每个站点创建分类
  for (const site of [...factorySites, ...exporterSites]) {
    const categories = [
      { name: "所有产品", parent_id: null, sort_order: 0 },
      { name: "热销产品", parent_id: null, sort_order: 1 },
      { name: "新品推荐", parent_id: null, sort_order: 2 },
      { name: "电子产品", parent_id: null, sort_order: 3 },
      { name: "机械设备", parent_id: null, sort_order: 4 },
    ];

    for (const cat of categories) {
      const [category] = await db
        .insert(siteCategoriesTable)
        .values({
          site_id: site.id,
          name: cat.name,
          parent_id: cat.parent_id,
          sort_order: cat.sort_order,
        })
        .returning();
      console.log(`创建站点分类: ${site.name} - ${category.name}`);
    }
  }

  // 5. 为工厂站点添加产品
  const products = await db.select().from(productsTable).limit(20);
  for (const site of factorySites) {
    const factory = factories.find((f) => f.id === site.entity_id);
    if (!factory) continue;

    // 只添加该工厂的产品
    const factoryProducts = products.filter((p) => p.factory_id === factory.id);
    const siteCategories = await db
      .select()
      .from(siteCategoriesTable)
      .where(eq(siteCategoriesTable.site_id, site.id));

    for (const product of factoryProducts) {
      const randomCategory =
        siteCategories[Math.floor(Math.random() * siteCategories.length)];

      await db.insert(siteProductsTable).values({
        site_id: site.id,
        product_id: product.id,
        site_price: Math.floor(Math.random() * 1000) + 100,
        site_name: product.name,
        site_description: product.description,
        is_featured: Math.random() > 0.8,
        sort_order: Math.floor(Math.random() * 100),
        is_visible: true,
        site_category_id: randomCategory?.id,
        seo_title: `${product.name} - ${site.name}`,
        seo_description: `查看${product.name}的详细信息，${site.name}为您提供优质产品`,
      });
    }
    console.log(
      `为工厂站点 ${site.name} 添加了 ${factoryProducts.length} 个产品`
    );
  }

  // 6. 为出口商站点添加下属工厂的所有产品
  for (const site of exporterSites) {
    const exporter = exporters.find((e) => e.id === site.entity_id);
    if (!exporter) continue;

    // 获取该出口商下的所有工厂
    const exporterFactories = factories.filter(
      (f) => f.exporter_id === exporter.id
    );
    const factoryIds = exporterFactories.map((f) => f.id);

    // 获取这些工厂的产品
    const allProducts = products.filter((p) =>
      factoryIds.includes(p.factory_id || "")
    );
    const siteCategories = await db
      .select()
      .from(siteCategoriesTable)
      .where(eq(siteCategoriesTable.site_id, site.id));

    for (const product of allProducts) {
      const randomCategory =
        siteCategories[Math.floor(Math.random() * siteCategories.length)];

      await db.insert(siteProductsTable).values({
        site_id: site.id,
        product_id: product.id,
        site_price: Math.floor(Math.random() * 1000) + 100,
        site_name: product.name,
        site_description: product.description,
        is_featured: Math.random() > 0.9,
        sort_order: Math.floor(Math.random() * 100),
        is_visible: true,
        site_category_id: randomCategory?.id,
        seo_title: `${product.name} - ${site.name}`,
        seo_description: `查看${product.name}的详细信息，${site.name}为您提供优质产品`,
      });
    }
    console.log(
      `为出口商站点 ${site.name} 添加了 ${allProducts.length} 个产品`
    );
  }

  // 7. 分配用户权限
  for (const site of [...factorySites, ...exporterSites]) {
    if (users.length > 0) {
      // 为第一个用户分配管理员权限
      await db
        .insert(userSitePermissionsTable)
        .values({
          user_id: users[0].id,
          site_id: site.id,
          role: "admin",
        })
        .onConflictDoUpdate({
          target: [
            userSitePermissionsTable.user_id,
            userSitePermissionsTable.site_id,
          ],
          set: { role: "admin" },
        });

      // 为第二个用户分配编辑权限
      if (users.length > 1) {
        await db
          .insert(userSitePermissionsTable)
          .values({
            user_id: users[1].id,
            site_id: site.id,
            role: "editor",
          })
          .onConflictDoUpdate({
            target: [
              userSitePermissionsTable.user_id,
              userSitePermissionsTable.site_id,
            ],
            set: { role: "editor" },
          });
      }

      // 为其他用户分配查看权限
      for (let i = 2;i < Math.min(users.length, 5);i++) {
        await db
          .insert(userSitePermissionsTable)
          .values({
            user_id: users[i].id,
            site_id: site.id,
            role: "viewer",
          })
          .onConflictDoUpdate({
            target: [
              userSitePermissionsTable.user_id,
              userSitePermissionsTable.site_id,
            ],
            set: { role: "viewer" },
          });
      }
      console.log(`为站点 ${site.name} 分配了用户权限`);
    }
  }

  console.log("站点数据播种完成！");
}

// 如果直接运行此文件
if (require.main === module) {
  seedSites()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
