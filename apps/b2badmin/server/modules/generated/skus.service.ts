import { SkusContract, skusTable } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class SkusBaseService extends BaseService<
  typeof skusTable,
  typeof SkusContract
> {
  constructor() {
    super(skusTable, SkusContract);
  }
}
