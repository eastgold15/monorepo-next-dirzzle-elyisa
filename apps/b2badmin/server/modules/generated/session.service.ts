import { sessionTable } from "@repo/contract"; 
import { SessionContract } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class SessionBaseService extends BaseService<typeof sessionTable, typeof SessionContract> {
    constructor() {
        super(sessionTable, SessionContract);
    }
}
