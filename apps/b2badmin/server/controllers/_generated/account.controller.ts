/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { AccountContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { accountService } from "../../modules/index";

export const accountController = new Elysia({ prefix: "/account" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get(
    "/",
    ({ query, auth, db }) => accountService.findAll(query, { db, auth }),
    { query: AccountContract.ListQuery }
  )
  .post(
    "/",
    ({ body, auth, db }) => accountService.create(body, { db, auth }),
    { body: AccountContract.Create }
  )
  .delete(
    "/:id",
    ({ params, auth, db }) => accountService.delete(params.id, { db, auth }),
    { params: t.Object({ id: t.String() }) }
  );
