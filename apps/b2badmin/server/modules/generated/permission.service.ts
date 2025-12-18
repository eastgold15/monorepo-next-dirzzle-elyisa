import { permissionTable } from "@repo/contract"; 
import { PermissionContract } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class PermissionBaseService extends BaseService<typeof permissionTable, typeof PermissionContract> {
    constructor() {
        super(permissionTable, PermissionContract);
    }
}
