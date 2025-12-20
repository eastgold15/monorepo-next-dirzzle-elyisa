/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { SkusContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { skusService } from "../../modules/index";

export const skusController = new Elysia({ prefix: "/skus" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get("/", ({ query, auth, db }) => skusService.findAll(query, { db, auth }), {
    query: SkusContract.ListQuery,
  })
  .post("/", ({ body, auth, db }) => skusService.create(body, { db, auth }), {
    body: SkusContract.Create,
  })
  .delete(
    "/:id",
    ({ params, auth, db }) => skusService.delete(params.id, { db, auth }),
    { params: t.Object({ id: t.String() }) }
  );
