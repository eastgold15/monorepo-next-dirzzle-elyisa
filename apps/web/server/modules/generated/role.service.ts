import { roleTable } from "@repo/contract";
import { RoleContract } from "@repo/contract";
import { BaseService } from "../../../lib/base-service";

export class RoleBaseService extends BaseService<typeof roleTable, typeof RoleContract> {
    constructor() {
        super(roleTable, RoleContract);
    }
}
