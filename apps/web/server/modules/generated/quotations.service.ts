import { quotationsTable } from "@repo/contract";
import { QuotationsContract } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class QuotationsBaseService extends BaseService<typeof quotationsTable, typeof QuotationsContract> {
    constructor() {
        super(quotationsTable, QuotationsContract);
    }
}
