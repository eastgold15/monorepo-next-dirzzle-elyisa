import { SiteConfigContract, siteConfigTable } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class SiteConfigBaseService extends BaseService<
  typeof siteConfigTable,
  typeof SiteConfigContract
> {
  constructor() {
    super(siteConfigTable, SiteConfigContract);
  }
}
