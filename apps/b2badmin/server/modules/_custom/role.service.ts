/**
 * ✍️ 【B2B Service - 业务自定义】
 * --------------------------------------------------------
 * 💡 你可以在此重写基类方法或添加私有业务逻辑。
 * 🛡️ 自动化脚本永远不会覆盖此文件。
 * --------------------------------------------------------
 */
import type { RoleContract } from "@repo/contract";
import { db } from "~/db/connection";
import { RoleGeneratedService } from "../_generated/role.service";
import type { ServiceContext } from "../_lib/base-service";

export class RoleService extends RoleGeneratedService {
  async list(
    ctx: ServiceContext,
    query?: typeof RoleContract.ListQuery.static
  ) {
    const res = await db.query.roleTable.findMany({
      where: {
        ...(query?.search ? { name: { like: `%${query.search}%` } } : {}),
        ...(query?.search
          ? { description: { like: `%${query.search}%` } }
          : {}),
        ...(query?.search ? { type: { like: `%${query.search}%` } } : {}),
      },
    });

    return res;
  }
}
