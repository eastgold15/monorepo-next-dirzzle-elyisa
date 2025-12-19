import { t } from "elysia";
import { AttributeContract } from "../generated/attribute.contract";

// 扩展创建属性契约，添加 values 字段
export const AttributeCustomContract = {
  ...AttributeContract,
  Create: t.Object({
    ...AttributeContract.Create.properties,
    values: t.Optional(t.Array(t.String())),
  }),
} as const;

export type AttributeCustomDTO = {
  Response: typeof AttributeContract.Response.static;
  Create: typeof AttributeCustomContract.Create.static;
  Update: typeof AttributeContract.Update.static;
  Patch: typeof AttributeContract.Patch.static;
  ListQuery: typeof AttributeContract.ListQuery.static;
};