/**
 * ✍️ 【B2B Service - 业务自定义】
 * --------------------------------------------------------
 * 💡 你可以在此重写基类方法或添加私有业务逻辑。
 * 🛡️ 自动化脚本永远不会覆盖此文件。
 * --------------------------------------------------------
 */
import { db } from "~/db/connection";
import { PermissionGeneratedService } from "../_generated/permission.service";
import type { ServiceContext } from "../_lib/base-service";

export class PermissionService extends PermissionGeneratedService {
  async list(ctx: ServiceContext, query: any) {
    const res = await db.query.permissionTable.findMany();
    return res;
  }
}
