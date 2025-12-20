import { MediaContract, mediaTable } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class MediaBaseService extends BaseService<
  typeof mediaTable,
  typeof MediaContract
> {
  constructor() {
    super(mediaTable, MediaContract);
  }
}
