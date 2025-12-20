import { Type as t } from "@sinclair/typebox";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { mediaMetadataTable } from "../../table.schema";

// === 基础 Schema ===
const Insert = createInsertSchema(mediaMetadataTable);
const UpdateBase = createUpdateSchema(mediaMetadataTable);
const Select = createSelectSchema(mediaMetadataTable);

const Create = t.Omit(Insert, ["id"]); // 文件上传时会自动生成的字段不需要手动提供
const UploadCreate = t.Pick(Create, ["mediaType"]); // 上传时只需要提供 mediaType，其他字段后端自动生成

export const MediaMetaTModel = {
  Insert,
  UpdateBase,
  Select,
  Create,
  UploadCreate,
};

export type MediaMetaT = {
  Insert: typeof Insert.static;
  UpdateBase: typeof UpdateBase.static;
  Select: typeof Select.static;
  Create: typeof Create.static;
  UploadCreate: typeof UploadCreate.static;
};
