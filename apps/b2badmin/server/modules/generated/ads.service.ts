import { AdsContract, adsTable } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class AdsBaseService extends BaseService<
  typeof adsTable,
  typeof AdsContract
> {
  constructor() {
    super(adsTable, AdsContract);
  }
}
