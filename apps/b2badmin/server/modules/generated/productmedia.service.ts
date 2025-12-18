import { productMediaTable } from "@repo/contract"; 
import { ProductMediaContract } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class ProductMediaBaseService extends BaseService<typeof productMediaTable, typeof ProductMediaContract> {
    constructor() {
        super(productMediaTable, ProductMediaContract);
    }
}
