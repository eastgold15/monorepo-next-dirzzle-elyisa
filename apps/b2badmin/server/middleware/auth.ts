import { Elysia, t } from "elysia";
import { usersService } from "../../server/modules/index";
import { dbPlugin } from "~/db/connection";
import { auth } from "~/lib/auth";
import { HttpError } from "elysia-http-problem-json";
import { and, eq } from "drizzle-orm";

export const authGuardMid = new Elysia({ name: 'authGuard' })

    .use(dbPlugin)
    .derive(async ({ request, db }) => {
        // 1. 验证 Session (这里省略你之前的代码)
        const headers = request.headers;
        const requestedSiteId = undefined // 👈 获取前端传来的意向站点
        // 1️⃣ verify session
        const session = await auth.api.getSession({ headers });
        if (!session) throw new HttpError.Unauthorized("未登录");

        // 2️⃣ fetch user
        const user = await db.query.usersTable.findFirst({
            where: { id: session.user.id },
        });
        if (!user) throw new HttpError.NotFound("用户不存在");
        // 用户拥有的角色和站点，挑一个最高的作为默认站点和角色
        const userRoleSites = await db.query.userSiteRolesTable.findMany({
            where: {
                userId: user.id,
            },
            with: {
                role: {
                    orderBy: { priority: "desc" },
                },
                site: true,
            },
        });

        if (userRoleSites.length === 0) {
            throw new HttpError.Forbidden("您没有任何站点权限");
        }

        // 3️⃣ 寻找匹配的“现场数据”
        let activeRelation;

        if (requestedSiteId) {
            // 在用户拥有的列表里找有没有这个 ID
            activeRelation = userRoleSites.find(item => item.site.id === requestedSiteId);

            // 安全保护：如果用户伪造了一个他不拥有的 site-id，直接报错
            if (!activeRelation) {
                throw new HttpError.Forbidden("您没有权限访问该指定的站点");
            }
        } else {
            // 如果没有传 header，默认取优先级最高的第一个
            activeRelation = userRoleSites[0];
        }


        const { site: currentSite, role } = activeRelation;

        // 4️⃣ 查库获取该角色在“当前站点”上下文下的权限
        const rolePermissions = await db.query.rolePermissionsTable.findMany({
            where: {
                roleId: role.id,
            },
            with: {
                permission: {
                    columns: {
                        name: true,
                    },
                },
            },
        });
        const permissions = [...new Set(rolePermissions.map(p => p.permission?.name).filter(Boolean))];
        return {
            user,
            currentSite,
            userId: user.id,
            siteId: currentSite.id,
            exporterId: currentSite.exporterId, // 如果是出口商站，这里有值
            factoryId: currentSite.factoryId,   // 如果是工厂站，这里有值
            siteType: currentSite.siteType,
            role,
            auth: {
                role: role.name,
                userId: user.id,
                siteId: currentSite.id,
                factoryId: currentSite.factoryId,   // 如果是工厂站，这里有值
                exporterId: currentSite.exporterId, // 如果是出口商站，这里有值
            },
            permissions // 自动注入到后续的所有 Hook 中
        }
    })
    .resolve(({ currentSite, role, user }) => {

        /**
         * 自动注入当前站点 ID 的过滤器
         * @param tableSchema Drizzle 表定义 (用于传统的 db.select 模式)
         * @param otherFilters 其他 SQL 条件
         */
        const t = (otherFilters?: any) => {
            // 如果是超级管理员，可以选择不过滤（视业务而定）
            if (user.isSuperAdmin && !currentSite) return otherFilters;

            // 返回 Drizzle 能够识别的过滤对象
            // 针对 db.query 这种关系查询模式：
            return {
                siteId: currentSite.id,
                ...(otherFilters || {})
            };
        };

        /**
         * 针对 db.select() 这种原生 SQL 模式的助手
         */
        const tx = (tableSchema: any, otherCondition?: any) => {
            return and(eq(tableSchema.siteId, currentSite.id), otherCondition);
        };

        return {
            t,  // 简化的关系查询助手
            tx, // 原生 SQL 查询助手
        };
    })
    .macro({
        allRoles: (roles: string[]) => ({
            beforeHandle({ role, status }) {

                if (!role) {
                    throw new HttpError.Forbidden("您没有任何角色权限");
                }

                if (!roles.includes(role.name)) {
                    return status(403, {
                        message: `该功能仅限角色 [${roles.join(",")}] 访问，您的角色是: ${role.name}`,
                        code: "ROLE_NOT_ALLOWED"
                    })
                }
            }

        }),

        allPermission: (name: string) => ({
            beforeHandle({ permissions, status }) {
                if (!permissions) {
                    throw new HttpError.Forbidden("您没有任何权限");
                }
                if (!permissions.includes(name) && !permissions.includes('*')) {
                    return status(403, `权限不足，需要 ${name} 权限`)
                }
            }
        })
    })
    .as("global")
