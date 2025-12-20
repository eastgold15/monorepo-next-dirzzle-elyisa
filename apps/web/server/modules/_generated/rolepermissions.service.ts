/**
 * 🤖 【WEB Service - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { rolePermissionsTable, RolePermissionsContract } from "@repo/contract";
import { WEBBaseService } from "../_lib/base-service";

export class RolePermissionsGeneratedService extends WEBBaseService<typeof rolePermissionsTable, typeof RolePermissionsContract> {
  constructor() {
    super(rolePermissionsTable, RolePermissionsContract);
  }
}