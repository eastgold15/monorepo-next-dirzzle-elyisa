/**
 * 🤖 【WEB Service - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { VerificationContract, verificationTable } from "@repo/contract";
import { WEBBaseService } from "../_lib/base-service";

export class VerificationGeneratedService extends WEBBaseService<
  typeof verificationTable,
  typeof VerificationContract
> {
  constructor() {
    super(verificationTable, VerificationContract);
  }
}
