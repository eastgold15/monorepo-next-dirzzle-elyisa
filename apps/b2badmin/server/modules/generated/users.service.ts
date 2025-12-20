import { UsersContract, usersTable } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class UsersBaseService extends BaseService<
  typeof usersTable,
  typeof UsersContract
> {
  constructor() {
    super(usersTable, UsersContract);
  }
}
