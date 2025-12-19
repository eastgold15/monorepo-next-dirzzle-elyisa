import { masterTable } from "@repo/contract";
import { MasterContract } from "@repo/contract";
import { BaseService } from "../../../lib/base-service";

export class MasterBaseService extends BaseService<typeof masterTable, typeof MasterContract> {
    constructor() {
        super(masterTable, MasterContract);
    }
}
