/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { MediaContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { mediaService } from "../../modules/index";

export const mediaController = new Elysia({ prefix: "/media" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get(
    "/",
    ({ query, auth, db }) => mediaService.findAll(query, { db, auth }),
    { query: MediaContract.ListQuery }
  )
  .post("/", ({ body, auth, db }) => mediaService.create(body, { db, auth }), {
    body: MediaContract.Create,
  })
  .delete(
    "/:id",
    ({ params, auth, db }) => mediaService.delete(params.id, { db, auth }),
    { params: t.Object({ id: t.String() }) }
  );
