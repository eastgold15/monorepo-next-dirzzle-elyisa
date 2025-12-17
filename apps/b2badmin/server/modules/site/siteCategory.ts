import {
    SiteCategoryTModel,
    siteCategoriesTable,
    siteProductsTable,
} from "@repo/contract";
import { and, eq, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { adminAuthPlugin } from "~/plugins/admin-auth.plugin";
import { buildTree } from "~/utils/buildTree";

/**
 * 站点分类管理路由
 *
 * 功能说明：
 * 1. 站点管理员可以管理自己站点的分类
 * 2. 支持树形结构的分类管理
 */
export const siteCategoryRoute = new Elysia({
    name: "Controller.siteCategory",
    prefix: "/site/category",
    tags: ["站点分类管理"],
})
    .use(dbPlugin)
    .use(adminAuthPlugin)

    // 获取站点的树形分类
    .get(
        "/",
        async ({ db, currentSite }) => {
            const { id: siteId } = currentSite;

            // 判断当前是不是站点管理员
            if (
                currentSite.siteType !== "factory" &&
                currentSite.siteType !== "exporter"
            ) {
                throw new HttpError.Forbidden("只有工厂站点或出口商站点可以管理分类");
            }

            // 验证权限
            if (!currentSite) {
                throw new HttpError.Forbidden("您没有权限访问任何站点");
            }
            // 查询当前站点的所有分类
            const categories = await db
                .select({
                    id: siteCategoriesTable.id,
                    name: siteCategoriesTable.name,
                    parentId: siteCategoriesTable.parentId,
                    sortOrder: siteCategoriesTable.sortOrder,
                    masterCategoryId: siteCategoriesTable.masterCategoryId,
                    siteId: siteCategoriesTable.siteId,
                })
                .from(siteCategoriesTable)
                .where(eq(siteCategoriesTable.siteId, siteId))
                .orderBy(siteCategoriesTable.sortOrder);

            // 构建树形结构
            const tree = buildTree(categories, "id", "parentId", "children");

            return tree;
        },
        {
            auth: true,
            detail: {
                summary: "获取站点的树形分类",
                description: "返回当前用户站点的树形分类结构，包含父子层级关系",
            },
        }
    )

    // 创建站点分类
    .post(
        "/",
        async ({ body, user, db, currentSite }) => {
            // 验证权限
            if (!currentSite) {
                throw new HttpError.Forbidden("您没有权限访问任何站点");
            }

            // 验证当前站点类型是否为工厂站点或出口商站点
            if (!["factory", "exporter"].includes(currentSite.siteType)) {
                throw new HttpError.Forbidden("只有工厂站点或出口商站点可以创建分类");
            }

            // 创建分类
            const [category] = await db
                .insert(siteCategoriesTable)
                .values({
                    name: body.name,
                    parentId: body.parentId || null,
                    sortOrder: body.sortOrder || 0,
                    siteId: currentSite.id,
                    masterCategoryId: body.masterCategoryId || null,
                })
                .returning();
            return category;
        },
        {
            auth: true,
            body: SiteCategoryTModel.Create,
            detail: {
                summary: "创建站点分类",
                description:
                    "需要站点id和分类名称，只有该站点的业务员才能创建分类。支持创建子分类。",
            },
        }
    )

    // 更新站点分类
    .put(
        "/update/:id",
        async ({ params: { id }, body, db, currentSite }) => {
            // 验证权限
            if (!currentSite) {
                throw new HttpError.Forbidden("您没有权限访问任何站点");
            }

            // 防止循环引用：不能将分类设置为自己的子分类
            if (body.parentId === id) {
                throw new HttpError.BadRequest("不能将分类设置为自己的子分类");
            }

            // 更新分类，确保只能更新当前站点的分类
            const [updated] = await db
                .update(siteCategoriesTable)
                .set({
                    name: body.name,
                    parentId: body.parentId || null,
                    sortOrder: body.sortOrder || 0,
                    masterCategoryId: body.masterCategoryId || null,
                })
                .where(
                    and(
                        eq(siteCategoriesTable.id, id),
                        eq(siteCategoriesTable.siteId, currentSite.id)
                    )
                )
                .returning();

            if (!updated) {
                throw new HttpError.NotFound("分类不存在或无权限修改");
            }

            return updated;
        },
        {
            auth: true,
            body: SiteCategoryTModel.Update,
            params: t.Object({
                id: t.String({ format: "uuid" }),
            }),
            detail: {
                summary: "更新站点分类",
                description: "更新分类信息，只能修改当前站点的分类",
            },
        }
    )

    // 删除站点分类
    .delete(
        "/delete/:id",
        async ({ params: { id }, db, currentSite, status }) => {
            // 验证权限
            if (!currentSite) {
                throw new HttpError.Forbidden("您没有权限访问任何站点");
            }

            // 检查是否有子分类
            const [hasChildren] = await db
                .select({ count: sql<number>`count(*)`.mapWith(Number).as("count") })
                .from(siteCategoriesTable)
                .where(
                    and(
                        eq(siteCategoriesTable.parentId, id),
                        eq(siteCategoriesTable.siteId, currentSite.id)
                    )
                )
                .limit(1);

            if (hasChildren && hasChildren.count > 0) {
                throw new HttpError.BadRequest(
                    "该分类下存在子分类，请先删除所有子分类"
                );
            }

            // 检查是否有关联的商品
            const [hasProducts] = await db
                .select({ count: sql<number>`count(*)`.mapWith(Number).as("count") })
                .from(siteProductsTable)
                .where(eq(siteProductsTable.siteCategoryId, id))
                .limit(1);

            if (hasProducts && hasProducts.count > 0) {
                throw new HttpError.BadRequest("该分类下存在商品，请先移除所有商品");
            }

            // 删除分类，确保只能删除当前站点的分类
            const result = await db
                .delete(siteCategoriesTable)
                .where(
                    and(
                        eq(siteCategoriesTable.id, id),
                        eq(siteCategoriesTable.siteId, currentSite.id)
                    )
                );

            return status(204);
        },
        {
            auth: true,
            params: t.Object({
                id: t.String({ format: "uuid" }),
            }),
            detail: {
                summary: "删除站点分类",
                description:
                    "删除分类及其所有关联数据，只能删除当前站点的分类。不能删除有子分类或关联商品的分类。",
            },
        }
    );
