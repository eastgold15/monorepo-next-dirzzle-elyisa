import z from "zod/v4";

// ==================== 编解码器 ====================

export const stringToNumber = z.codec(
  z.string(), // 输入类型（数据库 string）
  z.number(), // 输出类型（前端 number）
  {
    decode: (val) => Number(val), // string -> number，给前端用
    encode: (val) => val.toString(), // number -> string，存数据库用
  }
);

export const numberToString = z.codec(
  z.number(), //输入
  z.string(), //输出
  {
    decode: (val) => val.toString(),
    encode: (val) => Number(val),
  }
);

// ==================== 通用查询类型 ====================

export const paramIdZod = z.object({
  id: z.coerce.number(),
});

// 通用排序更新类型
export const UpdateSortDto = z.object({
  sortOrder: z.coerce.number(),
});

// ==================== 导出类型 ====================

export type UpdateSortDtoType = z.infer<typeof UpdateSortDto>;
