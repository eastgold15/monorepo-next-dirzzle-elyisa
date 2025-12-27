/**
 * ✍️ 【B2B Service - 业务自定义】
 * --------------------------------------------------------
 * 💡 你可以在此重写基类方法或添加私有业务逻辑。
 * 🛡️ 自动化脚本永远不会覆盖此文件。
 * --------------------------------------------------------
 */
import type { RolePermissionsContract } from "@repo/contract";
import { db } from "~/db/connection";
import { RolePermissionsGeneratedService } from "../_generated/rolepermissions.service";
import type { ServiceContext } from "../_lib/base-service";

export class RolePermissionsService extends RolePermissionsGeneratedService {
    async list(
        ctx: ServiceContext,
        query: typeof RolePermissionsContract.ListQuery.static
    ) {
        const res = await db.query.rolePermissionsTable.findMany({
            where: {
                ...(query?.roleId ? { roleId: query.roleId } : {}),
                ...(query?.search ? { permissionId: query.search } : {}),
            },

            with: {
                permission: true,
                role: true,
            }
        });
        return res
    }
}
