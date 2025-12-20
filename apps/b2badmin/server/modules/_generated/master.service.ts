/**
 * 🤖 【B2B Service - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { masterTable, MasterContract } from "@repo/contract";
import { B2BBaseService } from "../_lib/base-service";

export class MasterGeneratedService extends B2BBaseService<typeof masterTable, typeof MasterContract> {
  constructor() {
    super(masterTable, MasterContract);
  }
}