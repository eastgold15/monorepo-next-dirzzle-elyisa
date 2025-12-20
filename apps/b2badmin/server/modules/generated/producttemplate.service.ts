import { ProductTemplateContract, productTemplateTable } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class ProductTemplateBaseService extends BaseService<
  typeof productTemplateTable,
  typeof ProductTemplateContract
> {
  constructor() {
    super(productTemplateTable, ProductTemplateContract);
  }
}
