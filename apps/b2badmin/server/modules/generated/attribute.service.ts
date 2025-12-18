import { attributeTable } from "@repo/contract"; 
import { AttributeContract } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class AttributeBaseService extends BaseService<typeof attributeTable, typeof AttributeContract> {
    constructor() {
        super(attributeTable, AttributeContract);
    }
}
