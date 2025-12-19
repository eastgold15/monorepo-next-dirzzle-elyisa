import { salespersonAffiliationsTable } from "@repo/contract";
import { SalespersonAffiliationsContract } from "@repo/contract";
import { BaseService } from "../../../lib/base-service";

export class SalespersonAffiliationsBaseService extends BaseService<typeof salespersonAffiliationsTable, typeof SalespersonAffiliationsContract> {
    constructor() {
        super(salespersonAffiliationsTable, SalespersonAffiliationsContract);
    }
}
