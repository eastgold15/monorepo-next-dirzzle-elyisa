import { Type as t } from "@sinclair/typebox";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { mediaMetadataTable } from "./media.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(mediaMetadataTable);
const UpdateBase = createUpdateSchema(mediaMetadataTable);
const Select = createSelectSchema(mediaMetadataTable);

const Create = t.Omit(Insert, ["id"]); // 文件上传时会自动生成的字段不需要手动提供

export const MediaMetaTModel = {
  Insert,
  UpdateBase,
  Select,
  Create,
};

export type MediaMetaT = {
  Insert: typeof Insert.static;
  UpdateBase: typeof UpdateBase.static;
  Select: typeof Select.static;
  Create: typeof Create.static;
};
