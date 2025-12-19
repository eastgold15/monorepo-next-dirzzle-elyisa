import { factoriesTable } from "@repo/contract";
import { FactoriesContract } from "@repo/contract";
import { BaseService } from "../../../lib/base-service";

export class FactoriesBaseService extends BaseService<typeof factoriesTable, typeof FactoriesContract> {
    constructor() {
        super(factoriesTable, FactoriesContract);
    }
}
