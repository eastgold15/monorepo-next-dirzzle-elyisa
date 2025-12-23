/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { Elysia } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";

export const attributeController = new Elysia({ prefix: "/attribute" })
  .use(dbPlugin)
  .use(authGuardMid)



// 更新属性
// .put(
//   "/:id",
//   async ({ params: { id }, body, db }) => {
//     const {
//       name,
//       code,
//       inputType,
//       isRequired,
//       isSaleAttr,
//       sortOrder,
//       templateId,
//     } = body;

//     // 验证属性是否存在
//     const [existing] = await db
//       .select()
//       .from(attributeTable)
//       .where(eq(attributeTable.id, id))
//       .limit(1);

//     if (!existing) {
//       throw new HttpError.NotFound("属性不存在");
//     }

//     const attributeRes = await db
//       .update(attributeTable)
//       .set({
//         name,
//         code,
//         inputType,
//         isRequired,
//         isSaleAttr,
//         sortOrder,
//         templateId,
//       })
//       .where(eq(attributeTable.id, id))
//       .returning();

//     return attributeRes[0];
//   },
//   {
//     params: t.Object({
//       id: t.String(),
//     }),
//     body: AttributeContract.Update,
//     detail: {
//       summary: "更新属性",
//       description: "更新属性信息",
//       tags: ["Attributes"],
//     },
//   }
// )

// 获取属性详情（包含属性值）
// .get(
//   "/:id",
//   async ({ params: { id }, db }) => {
//     // 获取属性信息
//     const [attribute] = await db
//       .select()
//       .from(attributeTable)
//       .where(eq(attributeTable.id, id))
//       .limit(1);

//     if (!attribute) {
//       throw new HttpError.NotFound("属性不存在");
//     }

//     // 获取属性值
//     const values = await db
//       .select()
//       .from(attributeValueTable)
//       .where(eq(attributeValueTable.attributeId, id))
//       .orderBy(attributeValueTable.sortOrder);

//     return {
//       ...attribute,
//       values: values.map((v) => ({
//         id: v.id,
//         value: v.value,
//         sortOrder: v.sortOrder,
//       })),
//     };
//   },
//   {
//     params: t.Object({
//       id: t.String(),
//     }),
//     detail: {
//       summary: "获取属性详情",
//       description: "获取属性详细信息，包含所有可选值",
//       tags: ["Attributes"],
//     },
//   }
// )

// 获取属性列表
// .get(
//   "/",
//   async ({ query, db }) => {
//     const {
//       page = 1,
//       limit = 50,
//       search,
//       templateId,
//       inputType,
//       isSaleAttr,
//       sort = "sortOrder",
//       sortOrder = "asc",
//     } = query;

//     // 构建查询条件
//     const conditions = [];

//     if (search) {
//       conditions.push(
//         or(
//           like(attributeTable.name, `%${search}%`),
//           like(attributeTable.code, `%${search}%`)
//         )
//       );
//     }

//     if (templateId) {
//       conditions.push(eq(attributeTable.templateId, templateId));
//     }

//     if (inputType) {
//       conditions.push(eq(attributeTable.inputType, inputType!));
//     }

//     if (isSaleAttr !== undefined) {
//       conditions.push(eq(attributeTable.isSaleAttr, isSaleAttr!));
//     }

//     // 排序字段白名单
//     const allowedSortFields = {
//       id: attributeTable.id,
//       name: attributeTable.name,
//       code: attributeTable.code,
//       sortOrder: attributeTable.sortOrder,
//     };

//     const orderByField =
//       allowedSortFields[sort as keyof typeof allowedSortFields] ||
//       attributeTable.sortOrder;
//     const orderDirection =
//       sortOrder === "desc" ? desc(orderByField) : asc(orderByField);

//     // 构建查询
//     let queryBuilder = db
//       .select({
//         id: attributeTable.id,
//         name: attributeTable.name,
//         code: attributeTable.code,
//         inputType: attributeTable.inputType,
//         isRequired: attributeTable.isRequired,
//         isSaleAttr: attributeTable.isSaleAttr,
//         sortOrder: attributeTable.sortOrder,
//         templateId: attributeTable.templateId,
//       })
//       .from(attributeTable)
//       .$dynamic();

//     if (conditions.length > 0) {
//       queryBuilder = queryBuilder.where(and(...conditions));
//     }

//     queryBuilder = queryBuilder.orderBy(orderDirection);

//     // 分页
//     const items = await queryBuilder.limit(limit).offset((page - 1) * limit);

//     // 获取属性值数量
//     const attributeIds = items.map((item) => item.id);
//     const valueCounts =
//       attributeIds.length > 0
//         ? await db
//           .select({
//             attributeId: attributeValueTable.attributeId,
//             count: sql<number>`count(${attributeValueTable.id})`.mapWith(
//               Number
//             ),
//           })
//           .from(attributeValueTable)
//           .where(inArray(attributeValueTable.attributeId, attributeIds))
//           .groupBy(attributeValueTable.attributeId)
//         : [];

//     const valueCountMap = valueCounts.reduce(
//       (map, item) => {
//         map[item.attributeId] = item.count;
//         return map;
//       },
//       {} as Record<string, number>
//     );

//     // 格式化返回数据
//     return items.map((item) => ({
//       ...item,
//       valueCount: valueCountMap[item.id] || 0,
//     }));
//   },
//   {
//     query: AttributeContract.ListQuery,
//     detail: {
//       summary: "获取属性列表",
//       description: "分页获取属性列表，支持多条件筛选",
//       tags: ["Attributes"],
//     },
//   }
// )

// 批量删除属性
// .delete(
//   "/",
//   async ({ body: { ids }, db }) => {
//     await db.transaction(async (tx) => {
//       // 删除属性值
//       await tx
//         .delete(attributeValueTable)
//         .where(inArray(attributeValueTable.attributeId, ids));

//       // 删除属性
//       const result = await tx
//         .delete(attributeTable)
//         .where(inArray(attributeTable.id, ids))
//         .returning();
//     });

//     return { message: `成功删除 ${ids.length} 个属性` };
//   },
//   {
//     body: t.Object({
//       ids: t.Array(t.String(), { minItems: 1 }),
//     }),
//     detail: {
//       summary: "批量删除属性",
//       description: "批量删除选中的属性",
//       tags: ["Attributes"],
//     },
//   }
// )

// 添加属性值
// .post(
//   "/:id/values",
//   async ({ params: { id }, body: { values }, db }) => {
//     // 验证属性是否存在
//     const [attribute] = await db
//       .select()
//       .from(attributeTable)
//       .where(eq(attributeTable.id, id))
//       .limit(1);

//     if (!attribute) {
//       throw new HttpError.NotFound("属性不存在");
//     }

//     // 检查值是否重复
//     const existingValues = await db
//       .select()
//       .from(attributeValueTable)
//       .where(
//         and(
//           eq(attributeValueTable.attributeId, id),
//           inArray(attributeValueTable.value, values)
//         )
//       );

//     if (existingValues.length > 0) {
//       throw new HttpError.Conflict("部分属性值已存在");
//     }

//     // 添加属性值
//     const valueData = values.map((value: any, index: number) => ({
//       attributeId: id,
//       value,
//       valueCode: value.toLowerCase().replace(/\s+/g, "_"),
//       sortOrder: index,
//     }));

//     const newValues = await db
//       .insert(attributeValueTable)
//       .values(valueData)
//       .returning();

//     return newValues;
//   },
//   {
//     params: t.Object({
//       id: t.String(),
//     }),
//     body: t.Object({
//       values: t.Array(t.String(), { minItems: 1 }),
//     }),
//     detail: {
//       summary: "添加属性值",
//       description: "为属性添加可选值",
//       tags: ["Attributes"],
//     },
//   }
// )

// 更新属性值
// .put(
//   "/values/:id",
//   async ({ params: { id }, body, db }) => {
//     const { value, sortOrder } = body;
//     // 验证属性值是否存在
//     const [existing] = await db
//       .select({
//         id: attributeValueTable.id,
//         attributeId: attributeValueTable.attributeId,
//       })
//       .from(attributeValueTable)
//       .where(eq(attributeValueTable.id, id))
//       .limit(1);

//     if (!existing) {
//       throw new HttpError.NotFound("属性值不存在");
//     }

//     // 检查值是否重复
//     const [duplicate] = await db
//       .select()
//       .from(attributeValueTable)
//       .where(
//         and(
//           eq(attributeValueTable.value, value!),
//           eq(attributeValueTable.attributeId, existing.attributeId),
//           sql`${attributeValueTable.id} != ${id}`
//         )
//       )
//       .limit(1);

//     if (duplicate) {
//       throw new HttpError.Conflict("属性值已存在");
//     }

//     // 更新属性值
//     const updatedRes = await db
//       .update(attributeValueTable)
//       .set({
//         value,
//         sortOrder,
//       })
//       .where(eq(attributeValueTable.id, id))
//       .returning();

//     return updatedRes;
//   },
//   {
//     params: t.Object({
//       id: t.String(),
//     }),
//     body: AttributeValueContract.Update,
//     detail: {
//       summary: "更新属性值",
//       description: "更新属性值的内容和排序",
//       tags: ["Attributes"],
//     },
//   }
// )
