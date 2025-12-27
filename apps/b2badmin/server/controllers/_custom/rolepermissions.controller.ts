/**
 * 🤖 【B2B Controller - 自动生成基类】
 * --------------------------------------------------------
 * ⚠️ 请勿手动修改此文件，下次运行会被覆盖。
 * 💡 请前往 ../_custom 目录修改具体的业务契约。
 * --------------------------------------------------------
 */

import { RolePermissionsContract, rolePermissionsTable } from "@repo/contract";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { rolePermissionsService } from "../../modules/index";

export const rolepermissionsController = new Elysia({
  prefix: "/rolepermissions",
})
  .use(dbPlugin)
  .use(authGuardMid)
  .get(
    "/",
    ({ query, auth, db }) => rolePermissionsService.list({ db, auth }, query),
    { query: RolePermissionsContract.ListQuery }
  )
  .post(
    "/",
    ({ body, auth, db }) => rolePermissionsService.create(body, { db, auth }),
    { body: RolePermissionsContract.Create }
  )
  .delete(
    "/:id",
    ({ params, auth, db }) =>
      rolePermissionsService.delete(params.id, { db, auth }),
    { params: t.Object({ id: t.String() }) }
  )
  // 批量更新角色权限
  .post(
    "/batch/update",
    async ({ body, db }) => {
      const { roleId, permissionIds } = body;

      // 先删除该角色的所有权限
      await db
        .delete(rolePermissionsTable)
        .where(eq(rolePermissionsTable.roleId, roleId));

      // 如果有权限，则批量插入
      if (permissionIds.length > 0) {
        await db.insert(rolePermissionsTable).values(
          permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          }))
        );
      }

      return { success: true, count: permissionIds.length };
    },
    {
      body: RolePermissionsContract.BatchUpdate,
      detail: {
        summary: "批量更新角色权限",
        description: "替换角色的所有权限",
        tags: ["角色权限"],
      },
    }
  );
