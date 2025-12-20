import { CustomerContract, CustomerTable } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class CustomerBaseService extends BaseService<
  typeof CustomerTable,
  typeof CustomerContract
> {
  constructor() {
    super(CustomerTable, CustomerContract);
  }
}
