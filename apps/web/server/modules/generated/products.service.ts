import { productsTable } from "@repo/contract";
import { ProductsContract } from "@repo/contract";
import { BaseService } from "../../../lib/base-service";

export class ProductsBaseService extends BaseService<typeof productsTable, typeof ProductsContract> {
    constructor() {
        super(productsTable, ProductsContract);
    }
}
