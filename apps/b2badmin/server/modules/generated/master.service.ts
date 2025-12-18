import { MasterTable } from "@repo/contract"; 
import { MasterContract } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class MasterBaseService extends BaseService<typeof MasterTable, typeof MasterContract> {
    constructor() {
        super(MasterTable, MasterContract);
    }
}
