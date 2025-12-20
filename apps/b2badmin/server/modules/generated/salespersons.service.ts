import { SalespersonsContract, salespersonsTable } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class SalespersonsBaseService extends BaseService<
  typeof salespersonsTable,
  typeof SalespersonsContract
> {
  constructor() {
    super(salespersonsTable, SalespersonsContract);
  }
}
