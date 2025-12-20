/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { FactoriesContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { factoriesService } from "../../modules/index";

export const factoriesController = new Elysia({ prefix: "/factories" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get(
    "/",
    ({ query, auth, db }) => factoriesService.findAll(query, { db, auth }),
    { query: FactoriesContract.ListQuery }
  )
  .post(
    "/",
    ({ body, auth, db }) => factoriesService.create(body, { db, auth }),
    { body: FactoriesContract.Create }
  )
  .delete(
    "/:id",
    ({ params, auth, db }) => factoriesService.delete(params.id, { db, auth }),
    { params: t.Object({ id: t.String() }) }
  );
