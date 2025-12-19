import { attributeTable, AttributeContract } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class AttributeService extends BaseService<
    typeof attributeTable,
    typeof AttributeContract
> {
    constructor() {
        super(attributeTable, AttributeContract);
    }
}
