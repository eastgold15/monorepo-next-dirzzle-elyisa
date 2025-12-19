import { AttributeContract, attributeTable } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class AttributeBaseService extends BaseService<
    typeof attributeTable,
    typeof AttributeContract
> {
    constructor() {
        super(attributeTable, AttributeContract);
    }
}
