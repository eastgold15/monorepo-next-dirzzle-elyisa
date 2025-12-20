import { InquiryContract, inquiryTable } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class InquiryBaseService extends BaseService<
  typeof inquiryTable,
  typeof InquiryContract
> {
  constructor() {
    super(inquiryTable, InquiryContract);
  }
}
