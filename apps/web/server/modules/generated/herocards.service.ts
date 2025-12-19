import { heroCardsTable } from "@repo/contract";
import { HeroCardsContract } from "@repo/contract";
import { BaseService } from "../../../lib/base-service";

export class HeroCardsBaseService extends BaseService<typeof heroCardsTable, typeof HeroCardsContract> {
    constructor() {
        super(heroCardsTable, HeroCardsContract);
    }
}
