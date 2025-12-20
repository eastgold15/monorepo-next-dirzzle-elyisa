/**
 * ✍️ 【WEB Service - 业务自定义】
 * --------------------------------------------------------
 * 💡 你可以在此重写基类方法或添加私有业务逻辑。
 * 🛡️ 自动化脚本永远不会覆盖此文件。
 * --------------------------------------------------------
 */
import {
    mediaTable,
    productMasterCategoriesTable,
    productMediaTable,
    skusTable,
} from "@repo/contract";
import { and, asc, desc, eq, exists, like, type SQL, sql } from "drizzle-orm";
import { ProductsGeneratedService } from "../_generated/products.service";
import type { ServiceContext } from "../_lib/base-service";

export class ProductsService extends ProductsGeneratedService {
    /**
     * 🛒 获取带聚合信息的商品列表
     */
    async list(query: any, ctx: ServiceContext) {
        const {
            page = 1,
            limit = 10,
            sort = "createdAt",
            sortOrder = "desc",
            name,
            categoryId,
        } = query;

        // 1. 构建业务过滤条件
        const businessFilters: SQL[] = [];
        if (name) {
            businessFilters.push(like(this.table.name, `%${name}%`));
        }
        if (categoryId) {
            businessFilters.push(
                exists(
                    ctx.db
                        .select({})
                        .from(productMasterCategoriesTable)
                        .where(
                            and(
                                eq(productMasterCategoriesTable.productId, this.table.id),
                                eq(productMasterCategoriesTable.categoryId, categoryId)
                            )
                        )
                )
            );
        }

        // 2. 构建复杂 Join 查询
        const baseQuery = ctx.db
            .select({
                id: this.table.id,
                name: this.table.name,
                // 子查询获取 SKU 最小价格
                price: sql<number>`(select min(${skusTable.price}) from ${skusTable} where ${skusTable.productId} = ${this.table.id})`,
                status: this.table.status,
                createdAt: this.table.createdAt,
                updatedAt: this.table.updatedAt,
                categoryId: productMasterCategoriesTable.categoryId,
                imageUrl: mediaTable.url,
            })
            .from(this.table)
            .leftJoin(
                productMasterCategoriesTable,
                eq(this.table.id, productMasterCategoriesTable.productId)
            )
            .leftJoin(
                productMediaTable,
                eq(this.table.id, productMediaTable.productId)
            )
            .leftJoin(mediaTable, eq(productMediaTable.mediaId, mediaTable.id))
            .$dynamic();

        // 3. 注入站点隔离条件并执行分页
        const data = await this.withScope(baseQuery, ctx, businessFilters)
            .limit(limit)
            .offset((page - 1) * limit)
            .orderBy(
                sortOrder === "desc"
                    ? desc((this.table as any)[sort])
                    : asc((this.table as any)[sort])
            );

        // 4. 计算总数 (同样需要 scope)
        const total = await ctx.db.$count(
            this.table,
            and(...this.getScopeFilters(ctx), ...businessFilters)
        );

        return { data, total };
    }

    /**
     * 🔍 获取商品详情 (使用 Relational Query)
     */
    async getDetail(id: string, ctx: ServiceContext) {
        // Relational Query 目前不支持 withScope 注入，需手动合并 siteId
        const product = await ctx.db.query.productsTable.findFirst({
            where: and(
                eq(this.table.id, id),
                eq(this.table.siteId, ctx.siteId) // 🛡️ 强制站点隔离
            ),
            with: {
                productMedia: { with: { media: true } },
                productCategories: { with: { category: true } },
                skus: { with: { media: true } },
            },
        });

        if (!product) throw new Error("商品不存在");
        return product;
    }
}
