/**
 * 🤖 【WEB Service - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */
import { AttributeValueContract, attributeValueTable } from "@repo/contract";
import { WEBBaseService } from "../_lib/base-service";

export class AttributeValueGeneratedService extends WEBBaseService<
  typeof attributeValueTable,
  typeof AttributeValueContract
> {
  constructor() {
    super(attributeValueTable, AttributeValueContract);
  }
}
