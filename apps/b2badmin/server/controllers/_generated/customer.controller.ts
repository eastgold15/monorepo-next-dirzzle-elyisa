/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { CustomerContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { customerService } from "../../modules/index";

export const customerController = new Elysia({ prefix: "/customer" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get(
    "/",
    ({ query, auth, db }) => customerService.findAll(query, { db, auth }),
    { query: CustomerContract.ListQuery }
  )
  .post(
    "/",
    ({ body, auth, db }) => customerService.create(body, { db, auth }),
    { body: CustomerContract.Create }
  )
  .delete(
    "/:id",
    ({ params, auth, db }) => customerService.delete(params.id, { db, auth }),
    { params: t.Object({ id: t.String() }) }
  );
