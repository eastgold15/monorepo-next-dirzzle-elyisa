/**
 * 🤖 【B2B Controller - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 该文件由自动化脚本生成。手动修改将被下次运行覆盖。
 * 👈 如果需要自定义逻辑，请前往 ../_custom 目录。
 * --------------------------------------------------------
 */

import { ProductMediaContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { productMediaService } from "../../modules/index";

export const productmediaController = new Elysia({ prefix: "/productmedia" })
  .use(dbPlugin)
  .use(authGuardMid)
  .get(
    "/",
    ({ query, auth, db }) => productMediaService.findAll(query, { db, auth }),
    { query: ProductMediaContract.ListQuery }
  )
  .post(
    "/",
    ({ body, auth, db }) => productMediaService.create(body, { db, auth }),
    { body: ProductMediaContract.Create }
  )
  .delete(
    "/:id",
    ({ params, auth, db }) =>
      productMediaService.delete(params.id, { db, auth }),
    { params: t.Object({ id: t.String() }) }
  );
