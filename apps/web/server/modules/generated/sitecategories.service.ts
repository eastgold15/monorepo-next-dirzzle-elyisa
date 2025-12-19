import { siteCategoriesTable } from "@repo/contract";
import { SiteCategoriesContract } from "@repo/contract";
import { BaseService } from "../../../lib/base-service";

export class SiteCategoriesBaseService extends BaseService<typeof siteCategoriesTable, typeof SiteCategoriesContract> {
    constructor() {
        super(siteCategoriesTable, SiteCategoriesContract);
    }
}
