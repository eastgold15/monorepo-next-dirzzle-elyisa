import { SkuMediaContract, skuMediaTable } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class SkuMediaBaseService extends BaseService<
  typeof skuMediaTable,
  typeof SkuMediaContract
> {
  constructor() {
    super(skuMediaTable, SkuMediaContract);
  }
}
