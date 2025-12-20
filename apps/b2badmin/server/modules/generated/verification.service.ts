import { VerificationContract, verificationTable } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class VerificationBaseService extends BaseService<
  typeof verificationTable,
  typeof VerificationContract
> {
  constructor() {
    super(verificationTable, VerificationContract);
  }
}
