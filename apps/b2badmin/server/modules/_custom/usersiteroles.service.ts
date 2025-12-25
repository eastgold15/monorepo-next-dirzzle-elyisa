/**
 * ✍️ 【B2B Service - 业务自定义】
 * --------------------------------------------------------
 * 💡 你可以在此重写基类方法或添加私有业务逻辑。
 * 🛡️ 自动化脚本永远不会覆盖此文件。
 * --------------------------------------------------------
 */

import { db } from "~/db/connection";
import { UserSiteRolesGeneratedService } from "../_generated/usersiteroles.service";
import type { ServiceContext } from "../_lib/base-service";

export class UserSiteRolesService extends UserSiteRolesGeneratedService {


    // 获取该用户身份下的用户角色管理
    async list(ctx: ServiceContext) {
        return await db.query.userSiteRolesTable.findMany({
            with: {
                user: true,
                site: true,
                role: true,
            }
        });
    }
}
