import { dailyInquiryCounterTable } from "@repo/contract";
import { DailyInquiryCounterContract } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class DailyInquiryCounterBaseService extends BaseService<typeof dailyInquiryCounterTable, typeof DailyInquiryCounterContract> {
    constructor() {
        super(dailyInquiryCounterTable, DailyInquiryCounterContract);
    }
}
