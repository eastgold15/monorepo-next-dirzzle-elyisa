import { rolePermissionsTable } from "@repo/contract";
import { RolePermissionsContract } from "@repo/contract";
import { BaseService } from "../../../lib/base-service";

export class RolePermissionsBaseService extends BaseService<typeof rolePermissionsTable, typeof RolePermissionsContract> {
    constructor() {
        super(rolePermissionsTable, RolePermissionsContract);
    }
}
