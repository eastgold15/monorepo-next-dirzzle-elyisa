import { exportersTable } from "@repo/contract";
import { ExportersContract } from "@repo/contract";
import { BaseService } from "../../../lib/base-service";

export class ExportersBaseService extends BaseService<typeof exportersTable, typeof ExportersContract> {
    constructor() {
        super(exportersTable, ExportersContract);
    }
}
