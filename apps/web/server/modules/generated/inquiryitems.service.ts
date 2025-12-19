import { inquiryItemsTable } from "@repo/contract";
import { InquiryItemsContract } from "@repo/contract";
import { BaseService } from "../../../lib/base-service";

export class InquiryItemsBaseService extends BaseService<typeof inquiryItemsTable, typeof InquiryItemsContract> {
    constructor() {
        super(inquiryItemsTable, InquiryItemsContract);
    }
}
