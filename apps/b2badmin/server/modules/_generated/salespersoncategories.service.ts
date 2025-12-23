/**
 * 🤖 【B2B Service - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */
import { salespersonCategoriesTable, SalespersonCategoriesContract } from "@repo/contract";
import { B2BBaseService } from "../_lib/base-service";

export class SalespersonCategoriesGeneratedService extends B2BBaseService<typeof salespersonCategoriesTable, typeof SalespersonCategoriesContract> {
  constructor() { super(salespersonCategoriesTable, SalespersonCategoriesContract); }
}