/**
 * 🤖 【WEB Service - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */
import { inquiryItemsTable, InquiryItemsContract } from "@repo/contract";
import { WEBBaseService } from "../_lib/base-service";

export class InquiryItemsGeneratedService extends WEBBaseService<typeof inquiryItemsTable, typeof InquiryItemsContract> {
  constructor() { super(inquiryItemsTable, InquiryItemsContract); }
}