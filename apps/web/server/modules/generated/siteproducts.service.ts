import { siteProductsTable } from "@repo/contract";
import { SiteProductsContract } from "@repo/contract";
import { BaseService } from "../../../lib/base-service";

export class SiteProductsBaseService extends BaseService<typeof siteProductsTable, typeof SiteProductsContract> {
    constructor() {
        super(siteProductsTable, SiteProductsContract);
    }
}
