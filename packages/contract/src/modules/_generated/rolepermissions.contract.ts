/**
 * 🤖 【Contract Base - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */
import { t } from "elysia";
import { rolePermissionsTable } from "../../table.schema";
import { spread } from "../../helper/utils"; 

export const RolePermissionsBase = {
  fields: spread(rolePermissionsTable, 'select'),
  insertFields: spread(rolePermissionsTable, 'insert'),
} as const;
