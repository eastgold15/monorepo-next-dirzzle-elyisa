import {
  AttributeTemplateContract,
  attributeTemplateTable,
} from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class AttributeTemplateBaseService extends BaseService<
  typeof attributeTemplateTable,
  typeof AttributeTemplateContract
> {
  constructor() {
    super(attributeTemplateTable, AttributeTemplateContract);
  }
}
