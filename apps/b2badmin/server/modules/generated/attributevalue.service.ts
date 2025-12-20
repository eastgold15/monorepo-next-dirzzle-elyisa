import { AttributeValueContract, attributeValueTable } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class AttributeValueBaseService extends BaseService<
  typeof attributeValueTable,
  typeof AttributeValueContract
> {
  constructor() {
    super(attributeValueTable, AttributeValueContract);
  }
}
