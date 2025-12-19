import { mediaMetadataTable } from "@repo/contract";
import { MediaMetadataContract } from "@repo/contract";
import { BaseService } from "~/lib/base-service";

export class MediaMetadataBaseService extends BaseService<typeof mediaMetadataTable, typeof MediaMetadataContract> {
    constructor() {
        super(mediaMetadataTable, MediaMetadataContract);
    }
}
