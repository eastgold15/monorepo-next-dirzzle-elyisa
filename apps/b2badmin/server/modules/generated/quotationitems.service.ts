import { quotationItemsTable } from "@repo/contract"; 
import { QuotationItemsContract } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class QuotationItemsBaseService extends BaseService<typeof quotationItemsTable, typeof QuotationItemsContract> {
    constructor() {
        super(quotationItemsTable, QuotationItemsContract);
    }
}
