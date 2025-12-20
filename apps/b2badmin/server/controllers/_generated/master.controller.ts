/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { MasterContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { masterService } from "../../modules/index";

export const masterController = new Elysia({ prefix: "/master" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get(
    "/",
    ({ query, auth, db }) => masterService.findAll(query, { db, auth }),
    { query: MasterContract.ListQuery }
  )
  .post("/", ({ body, auth, db }) => masterService.create(body, { db, auth }), {
    body: MasterContract.Create,
  })
  .delete(
    "/:id",
    ({ params, auth, db }) => masterService.delete(params.id, { db, auth }),
    { params: t.Object({ id: t.String() }) }
  );
