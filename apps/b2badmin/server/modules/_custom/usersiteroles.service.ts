/**
 * ✍️ 【B2B Service - 业务自定义】
 * --------------------------------------------------------
 * 💡 你可以在此重写基类方法或添加私有业务逻辑。
 * 🛡️ 自动化脚本永远不会覆盖此文件。
 * --------------------------------------------------------
 */

import type { UserSiteRolesDTO } from "@repo/contract";
import { sitesTable, userSiteRolesTable } from "@repo/contract";
import { and, eq } from "drizzle-orm";
import { HttpError } from "elysia-http-problem-json";
import { UserSiteRolesGeneratedService } from "../_generated/usersiteroles.service";
import type { ServiceContext } from "../_lib/base-service";

type UserDto = {
    id: string;
    name: string;
    address: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    image: string | null;
    isSuperAdmin: boolean;
    phone: string | null;
    city: string | null;
};
export class UserSiteRolesService extends UserSiteRolesGeneratedService {
    /**
     * 获取该用户身份下的用户角色管理列表
     * 根据用户身份过滤可见的用户角色分配
     */
    async list(ctx: ServiceContext, user: UserDto) {
        const { auth, db } = ctx;
        const { userId, siteId, factoryId, exporterId, role } = auth;

        // // 获取当前用户的完整信息以判断身份
        // const currentUser = await db.query.usersTable.findFirst({
        //     where: { id: userId },
        // });

        // if (!currentUser) {
        //     throw new HttpError.Unauthorized("用户不存在");
        // }

        // 超管可以看到所有用户角色分配
        if (user.isSuperAdmin) {
            return await db.query.userSiteRolesTable.findMany({
                with: {
                    user: {
                        columns: {
                            id: true,
                            name: true,
                            email: true,
                            isActive: true,
                            isSuperAdmin: true,
                        },
                    },
                    site: {
                        columns: {
                            id: true,
                            name: true,
                            domain: true,
                            siteType: true,
                            factoryId: true,
                            exporterId: true,
                        },
                    },
                    role: {
                        columns: {
                            id: true,
                            name: true,
                            description: true,
                            type: true,
                            priority: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
        }

        // 非超管需要根据身份过滤
        // 获取当前用户所属出口商的所有工厂ID
        let accessibleFactoryIds: string[] = [];
        const accessibleExporterIds: string[] = [];

        if (exporterId) {
            accessibleExporterIds.push(exporterId);

            // 获取该出口商下的所有工厂
            const factories = await db.query.factoriesTable.findMany({
                where: { exporterId },
                columns: { id: true },
            });
            accessibleFactoryIds = factories.map((f) => f.id);
        }

        if (factoryId) {
            accessibleFactoryIds.push(factoryId);
        }
        // 获取可访问的站点ID
        const accessibleSites = await db
            .select()
            .from(sitesTable)
            .where((sites) => {
                const conditions = [];

                // 当前站点
                conditions.push(eq(sites.id, siteId));

                // 站点身份：可看到该站点下的所有站点
                // 出口商身份：可看到该出口商下的所有站点
                if (exporterId) {
                    conditions.push(eq(sites.exporterId, exporterId));
                }

                // 工厂身份：可看到该工厂的站点
                if (factoryId) {
                    conditions.push(eq(sites.factoryId, factoryId));
                }
                return conditions.length > 0 ? and(...conditions) : undefined;
            });

        const accessibleSiteIds = accessibleSites.map((s) => s.id);

        // 获取可分配的用户（属于该出口商/工厂的用户）
        const accessibleUserIds = await this.getAccessibleUserIds(ctx);

        // and(
        //     inArray(userSiteRolesTable.siteId, accessibleSiteIds),
        //     accessibleUserIds.length > 0
        //         ? inArray(userSiteRolesTable.userId, accessibleUserIds)
        //         : undefined
        // ),

        // 查询符合条件的用户角色分配
        return await db.query.userSiteRolesTable.findMany({
            where: {
                ...(accessibleUserIds.length > 0
                    ? {
                        userId: {
                            in: accessibleUserIds,
                        },
                    }
                    : {}),
                siteId: {
                    in: accessibleSiteIds,
                },
            },
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true,
                        email: true,
                        isActive: true,
                        isSuperAdmin: true,
                    },
                },
                site: {
                    columns: {
                        id: true,
                        name: true,
                        domain: true,
                        siteType: true,
                        factoryId: true,
                        exporterId: true,
                    },
                },
                role: {
                    columns: {
                        id: true,
                        name: true,
                        description: true,
                        type: true,
                        priority: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    /**
     * 分配用户到站点角色
     * 权限规则：
     * 1. 超管可以为所有人分配
     * 2. 出口商可以为工厂用户和业务员分配到旗下站点
     * 3. 工厂用户可以为业务员分配到该站点
     */
    async createUser(data: UserSiteRolesDTO["Create"], ctx: ServiceContext) {
        const { auth, db } = ctx;
        const {
            userId: currentUserId,
            siteId: currentSiteId,
            factoryId,
            exporterId,
        } = auth;
        const { userId: targetUserId, siteId: targetSiteId, roleId } = data;

        // 获取当前用户的完整信息
        const currentUser = await db.query.usersTable.findFirst({
            where: { id: currentUserId },
            columns: { isSuperAdmin: true },
        });

        if (!currentUser) {
            throw new HttpError.Unauthorized("用户不存在");
        }

        // 获取目标站点信息
        const targetSite = await db.query.sitesTable.findFirst({
            where: { id: targetSiteId },
        });

        if (!targetSite) {
            throw new HttpError.NotFound("目标站点不存在");
        }

        // 获取目标角色信息
        const targetRole = await db.query.roleTable.findFirst({
            where: { id: roleId },
        });

        if (!targetRole) {
            throw new HttpError.NotFound("目标角色不存在");
        }

        // 权限验证
        await this.validateAssignmentPermission(
            ctx,
            targetUserId,
            targetSite,
            currentUser.isSuperAdmin
        );

        // and(
        //     eq(userSiteRolesTable.userId, targetUserId),
        //     eq(userSiteRolesTable.siteId, targetSiteId)
        // ),
        // 检查是否已存在相同分配
        const existing = await db.query.userSiteRolesTable.findFirst({
            where: {
                userId: targetUserId,
                siteId: targetSiteId,
            },
        });

        if (existing) {
            throw new HttpError.Conflict("该用户已在此站点分配了角色");
        }

        // 创建用户站点角色分配
        const result = await db
            .insert(userSiteRolesTable)
            .values({
                userId: targetUserId,
                siteId: targetSiteId,
                roleId,
                createdAt: new Date(),
            })
            .returning();

        return result[0];
    }

    /**
     * 更新用户站点角色
     */
    async update(
        id: string,
        data: Partial<UserSiteRolesDTO["Update"]>,
        ctx: ServiceContext
    ) {
        const { auth, db } = ctx;

        // 获取现有分配记录
        const existing = await db.query.userSiteRolesTable.findFirst({
            where: {
                userId: id,
            }, // 注意：这里用的是 userId，实际应该用主键
        });

        // 由于 userSiteRolesTable 的主键是复合主键 (userId, siteId)
        // 需要重新查询
        const assignments = await db.query.userSiteRolesTable.findMany();
        const assignment = assignments.find((a) => a.userId === id); // 临时方案

        if (!assignment) {
            throw new HttpError.NotFound("角色分配不存在");
        }

        // 获取当前用户信息
        const currentUser = await db.query.usersTable.findFirst({
            where: { id: auth.userId },
            columns: { isSuperAdmin: true },
        });

        // 权限验证
        await this.validateAssignmentPermission(
            ctx,
            assignment.userId,
            assignment.siteId as any,
            currentUser?.isSuperAdmin ?? false
        );

        // 更新角色
        const result = await db
            .update(userSiteRolesTable)
            .set({ roleId: data.roleId })
            .where(
                and(
                    eq(userSiteRolesTable.userId, assignment.userId),
                    eq(userSiteRolesTable.siteId, assignment.siteId)
                )
            )
            .returning();

        return result;
    }

    /**
     * 删除用户站点角色分配
     */
    async delete(id: string, ctx: ServiceContext) {
        const { auth, db } = ctx;

        // 查找分配记录（id 实际是 userId）
        const assignments = await db.query.userSiteRolesTable.findMany({
            where: {
                userId: id,
            },
        });

        if (assignments.length === 0) {
            throw new HttpError.NotFound("角色分配不存在");
        }

        // 获取当前用户信息
        const currentUser = await db.query.usersTable.findFirst({
            where: { id: auth.userId },
            columns: { isSuperAdmin: true },
        });

        // 验证每个分配的权限
        for (const assignment of assignments) {
            await this.validateAssignmentPermission(
                ctx,
                assignment.userId,
                assignment.siteId as any,
                currentUser?.isSuperAdmin ?? false
            );
        }

        // 删除所有匹配的分配
        await db
            .delete(userSiteRolesTable)
            .where(eq(userSiteRolesTable.userId, id));

        return { success: true };
    }

    /**
     * 验证是否有权限进行角色分配
     */
    private async validateAssignmentPermission(
        ctx: ServiceContext,
        targetUserId: string,
        targetSite: any,
        isSuperAdmin: boolean
    ): Promise<void> {
        const { auth, db } = ctx;
        const { factoryId, exporterId } = auth;

        // 超管拥有所有权限
        if (isSuperAdmin) {
            return;
        }

        // 获取目标用户所属的工厂或出口商
        const accessibleUserIds = await this.getAccessibleUserIds(ctx);

        // 检查目标用户是否在可分配列表中
        if (!accessibleUserIds.includes(targetUserId)) {
            throw new HttpError.Forbidden("您无权为该用户分配角色");
        }

        // 检查目标站点是否在可管理的范围内
        const canManageSite =
            // 出口商可以分配到自己的站点
            (exporterId && targetSite.exporterId === exporterId) ||
            // 工厂可以分配到自己的站点
            (factoryId && targetSite.factoryId === factoryId);

        if (!canManageSite) {
            throw new HttpError.Forbidden("您无权管理该站点");
        }
    }

    /**
     * 获取当前用户可以分配角色的用户ID列表
     * 规则：
     * 1. 超管：所有用户
     * 2. 出口商：旗下工厂的用户 + 旗下业务员
     * 3. 工厂：工厂的业务员
     */
    private async getAccessibleUserIds(ctx: ServiceContext): Promise<string[]> {
        const { auth, db } = ctx;
        const { userId, factoryId, exporterId } = auth;

        // 获取当前用户信息
        const currentUser = await db.query.usersTable.findFirst({
            where: { id: userId },
            columns: { isSuperAdmin: true },
        });

        if (!currentUser) {
            return [];
        }

        // 超管可以访问所有用户
        if (currentUser.isSuperAdmin) {
            const allUsers = await db.query.usersTable.findMany({
                columns: { id: true },
            });
            return allUsers.map((u) => u.id);
        }

        const accessibleUserIds: string[] = [];

        // 1. 获取旗下工厂的用户
        if (exporterId || factoryId) {
            const factoryIds = factoryId ? [factoryId] : [];

            // 如果是出口商，获取旗下所有工厂
            if (exporterId && !factoryId) {
                const factories = await db.query.factoriesTable.findMany({
                    where: { exporterId },
                    columns: { id: true },
                });
                factoryIds.push(...factories.map((f) => f.id));
            }


            // (sites) => {
            //     const conditions = factoryIds.map((fid) =>
            //         eq(sites.factoryId, fid)
            //     );
            //     return conditions.length > 0 ? and(...conditions) : undefined;
            // },



            // 查找这些工厂站点的用户角色分配
            if (factoryIds.length > 0) {
                const factorySites = await db.query.sitesTable.findMany({
                    where: {
                        ...(factoryIds.length > 0 ? {
                            factoryId: {
                                in: factoryIds,
                            },
                        } : {}),

                    },
                    columns: { id: true },
                });

                const factorySiteIds = factorySites.map((s) => s.id);

                // inArray(userSiteRolesTable.siteId, factorySiteIds)

                // 获取这些站点的用户
                const factoryUserRoles = await db.query.userSiteRolesTable.findMany({
                    where: {
                        siteId: {
                            in: factorySiteIds,
                        },
                    },
                    columns: { userId: true },
                });

                accessibleUserIds.push(...factoryUserRoles.map((ur) => ur.userId));
            }
        }


        // (sa) => {
        //     const conditions = [];

        //     // 出口商的业务员
        //     if (exporterId) {
        //         conditions.push(eq(sa.exporterId, exporterId));
        //     }

        //     // 工厂的业务员
        //     if (factoryId) {
        //         conditions.push(eq(sa.factoryId, factoryId));
        //     }

        //     return conditions.length > 0 ? and(...conditions) : undefined;
        // },

        // 2. 获取业务员
        const salespersonAffiliations =
            await db.query.salespersonAffiliationsTable.findMany({
                where: {
                    ...(exporterId ? { exporterId } : {}),
                    ...(factoryId ? { factoryId } : {}),
                },
                with: {
                    salesperson: {
                        columns: { userId: true },
                    },
                },
            });

        accessibleUserIds.push(
            ...salespersonAffiliations
                .filter(sa => sa?.salesperson !== null) // 过滤掉salesperson为null的项
                .map(sa => sa.salesperson!.userId) // 使用非空断言操作符
        );

        // 去重
        return [...new Set(accessibleUserIds)];
    }
}
