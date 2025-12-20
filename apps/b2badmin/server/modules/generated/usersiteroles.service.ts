import { UserSiteRolesContract, userSiteRolesTable } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class UserSiteRolesBaseService extends BaseService<
  typeof userSiteRolesTable,
  typeof UserSiteRolesContract
> {
  constructor() {
    super(userSiteRolesTable, UserSiteRolesContract);
  }
}
