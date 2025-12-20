/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { SiteCategoriesContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { siteCategoriesService } from "../../modules/index";

export const sitecategoriesController = new Elysia({
  prefix: "/sitecategories",
})
  .use(dbPlugin)
  .use(authGuardMid)
  .get(
    "/",
    ({ query, auth, db }) => siteCategoriesService.findAll(query, { db, auth }),
    { query: SiteCategoriesContract.ListQuery }
  )
  .post(
    "/",
    ({ body, auth, db }) => siteCategoriesService.create(body, { db, auth }),
    { body: SiteCategoriesContract.Create }
  )
  .delete(
    "/:id",
    ({ params, auth, db }) =>
      siteCategoriesService.delete(params.id, { db, auth }),
    { params: t.Object({ id: t.String() }) }
  );
