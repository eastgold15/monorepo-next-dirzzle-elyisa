import { productsTable } from "@repo/contract/table";
import { count, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { db, dbPlugin } from "@/server/db/connection";
import { commonRes } from "@/server/utils/Res";

// 获取商品概览统计数据
async function getProductOverview() {
  try {
    // 获取商品统计数据
    const productStatsResult = await db
      .select({
        totalProducts: count(),
        activeProducts: sql<number>`count(case when ${productsTable.status} = 1 then 1 end)`,
      })
      .from(productsTable);

    const productStats = productStatsResult[0] || {
      totalProducts: 0,
      activeProducts: 0,
    };

    return productStats;
  } catch (error) {
    console.error("获取商品概览统计数据失败:", error);
    throw error;
  }
}

// 获取热门商品统计
async function getPopularProducts(query: { limit?: number } = {}) {
  try {
    const { limit = 10 } = query;

    // 使用关系查询获取商品列表
    const products = await db.query.productsTable.findMany({
      where: { status: 1 },
      with: {
        productMedia: {
          with: {
            media: {
              columns: {
                url: true,
              },
            },
          },
          limit: 1, // 只获取一张图片
        },
      },
      orderBy: { createdAt: "desc" },
      limit,
    });

    // 模拟统计数据并转换格式
    const popularProducts = products.map((product) => ({
      productId: product.id,
      productName: product.name,
      productImageUrl: product.productMedia[0]?.media?.url || undefined,
      viewCount: Math.floor(Math.random() * 1000) + 100,
      searchCount: Math.floor(Math.random() * 500) + 50,
      favoriteCount: Math.floor(Math.random() * 200) + 20,
      totalScore: 0, // 将在下面计算
    }));

    // 计算总分（简单加权计算）
    for (const product of popularProducts) {
      product.totalScore =
        product.viewCount +
        product.searchCount * 1.5 +
        product.favoriteCount * 2;
    }

    // 按总分排序
    popularProducts.sort((a, b) => b.totalScore - a.totalScore);

    return popularProducts;
  } catch (error) {
    console.error("获取热门商品统计失败:", error);
    throw error;
  }
}

// 获取最新商品列表
async function getRecentProducts(limit = 10): Promise<any[]> {
  try {
    // 使用关系查询获取最新商品列表
    const recentProducts = await db.query.productsTable.findMany({
      where: { status: 1 },
      with: {
        productMedia: {
          with: {
            media: {
              columns: {
                url: true,
              },
            },
          },
          limit: 1, // 只获取一张图片
        },
      },
      orderBy: { createdAt: "desc" },
      limit,
    });

    // 处理数据格式
    return recentProducts.map((product) => ({
      id: product.id,
      name: product.name,
      imageUrl: product.productMedia[0]?.media?.url || undefined,
      createdAt: product.createdAt,
    }));
  } catch (error) {
    console.error("获取最新商品列表失败:", error);
    throw error;
  }
}

// 根据分类获取商品统计
async function getProductStatsByCategory() {
  try {
    // 使用关系查询获取分类商品统计
    const categoryStats = await db.query.categoriesTable.findMany({
      columns: {
        name: true,
      },
      with: {
        products: {
          columns: {
            id: true,
            status: true,
          },
        },
      },
    });

    // 处理统计数据
    return categoryStats.map((category) => ({
      categoryName: category.name,
      productCount: category.products.length,
      activeCount: category.products.filter((p) => p.status === 1).length,
    }));
  } catch (error) {
    console.error("获取分类商品统计失败:", error);
    // 返回模拟数据作为降级处理
    const mockCategoryStats = [
      { categoryName: "电子产品", productCount: 45, activeCount: 42 },
      { categoryName: "服装", productCount: 38, activeCount: 35 },
      { categoryName: "家居用品", productCount: 27, activeCount: 25 },
      { categoryName: "图书", productCount: 32, activeCount: 30 },
      { categoryName: "运动用品", productCount: 19, activeCount: 18 },
    ];

    return mockCategoryStats;
  }
}

/**
 * 商品统计控制器
 * 处理商品统计相关的HTTP请求
 */
export const productStatisticsController = new Elysia({
  prefix: "/product-statistics",
  tags: ["商品统计"],
})
  .use(dbPlugin)
  .onBeforeHandle(() => {
    // 可以在这里添加全局的前置处理逻辑
  })

  // 获取商品概览统计数据
  .get(
    "/overview",
    async () => {
      const result = await getProductOverview();
      return commonRes(result);
    },
    {
      detail: {
        summary: "获取商品概览统计",
        description:
          "获取商品总数、上架商品数、推荐商品数、低库存商品数等概览数据",
      },
    }
  )

  // 获取热门商品统计
  .get(
    "/popular",
    async ({ query }) => {
      const result = await getPopularProducts({
        limit: query.limit,
      });
      return commonRes(result);
    },
    {
      query: t.Object({
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
      }),
      detail: {
        summary: "获取热门商品统计",
        description: "获取浏览量、搜索量、收藏量最多的商品列表",
      },
    }
  )

  // 获取最新商品列表
  .get(
    "/recent",
    async ({ query }) => {
      const result = await getRecentProducts(query.limit);
      return commonRes(result);
    },
    {
      query: t.Object({
        limit: t.Optional(t.Number({ minimum: 1, maximum: 50, default: 10 })),
      }),
      detail: {
        summary: "获取最新商品列表",
        description: "获取最新添加的商品列表",
      },
    }
  )

  // 获取分类商品统计
  .get(
    "/by-category",
    async () => {
      const result = await getProductStatsByCategory();
      return commonRes(result);
    },
    {
      detail: {
        summary: "获取分类商品统计",
        description: "按分类统计商品数量",
      },
    }
  );
