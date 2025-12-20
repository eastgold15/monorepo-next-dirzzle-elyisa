import { AccountContract, accountTable } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class AccountBaseService extends BaseService<
  typeof accountTable,
  typeof AccountContract
> {
  constructor() {
    super(accountTable, AccountContract);
  }
}
