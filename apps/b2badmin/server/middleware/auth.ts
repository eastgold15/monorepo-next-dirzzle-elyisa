import { Elysia, t } from "elysia";
import { usersService } from "../../server/modules/index";
import { dbPlugin } from "~/db/connection";
import { auth } from "~/lib/auth";

export const authGuard = new Elysia({ name: 'authGuard' })

    .use(dbPlugin)
    .derive(async ({ request, db, status }) => {

        const siteId = request.headers.get("x-site-id");
        if (!siteId) throw new Error("请选择管理站点 (x-site-id)");

        // 1. 验登录 (假设已集成 session)
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) throw new Error("未登录");


        // 2. 查身份：获取用户在该站点的 Role 和 Site 详情
        const activeRelation = await db.query.userSiteRolesTable.findFirst({
            where: {
                userId: session.user.id,
                siteId: siteId,
            },
            with: { role: true, site: true }
        });
        if (!activeRelation) { return status(403, "无权访问该站点") }

        const { site, role } = activeRelation;
    })