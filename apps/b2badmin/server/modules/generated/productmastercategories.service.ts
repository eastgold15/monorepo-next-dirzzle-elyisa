import { productMasterCategoriesTable } from "@repo/contract";
import { ProductMasterCategoriesContract } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class ProductMasterCategoriesBaseService extends BaseService<typeof productMasterCategoriesTable, typeof ProductMasterCategoriesContract> {
    constructor() {
        super(productMasterCategoriesTable, ProductMasterCategoriesContract);
    }
}
