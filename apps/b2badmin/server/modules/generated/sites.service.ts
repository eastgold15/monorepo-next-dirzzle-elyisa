import { SitesContract, sitesTable } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class SitesBaseService extends BaseService<
  typeof sitesTable,
  typeof SitesContract
> {
  constructor() {
    super(sitesTable, SitesContract);
  }
}
