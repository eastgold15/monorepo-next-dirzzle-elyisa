import { TranslationDictContract, translationDictTable } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class TranslationDictBaseService extends BaseService<
  typeof translationDictTable,
  typeof TranslationDictContract
> {
  constructor() {
    super(translationDictTable, TranslationDictContract);
  }
}
