import { salespersonCategoriesTable } from "@repo/contract";
import { SalespersonCategoriesContract } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class SalespersonCategoriesBaseService extends BaseService<typeof salespersonCategoriesTable, typeof SalespersonCategoriesContract> {
    constructor() {
        super(salespersonCategoriesTable, SalespersonCategoriesContract);
    }
}
