import { usersTable } from "@repo/contract"; 
import { UsersContract } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class UsersBaseService extends BaseService<typeof usersTable, typeof UsersContract> {
    constructor() {
        super(usersTable, UsersContract);
    }
}
