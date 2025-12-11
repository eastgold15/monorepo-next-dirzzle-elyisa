import { mediaTable } from "@repo/contract/table";
import { asc, eq, inArray } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { dbPlugin } from "@/server/db/connection";
import { localeMiddleware } from "@/server/plugins/locale";
import { commonRes } from "@/server/utils/Res";

export const mediaRoute = new Elysia({ prefix: "media" }) // 获取图片 - 前端用户使用
  .use(localeMiddleware)
  .use(dbPlugin)
  .get(
    "/url/:id",
    async ({ locale, db, params: { id } }) => {
      console.log("获取分类树形列表，当前语言:", locale);
      const media = await db
        .select()
        .from(mediaTable)
        .where(eq(mediaTable.id, id))
        .orderBy(asc(mediaTable.sortIndex));

      return commonRes(media[0].url, 200, "获取图片url成功");
    },
    {
      params: t.Object({
        id: t.Number(),
      }),
    }
  )
  .get(
    "/urls",
    async ({ locale, db, query: { ids } }) => {
      console.log("获取图片url列表，当前语言:", locale);
      const media = await db
        .select({
          urls: mediaTable.url,
        })
        .from(mediaTable)
        .where(inArray(mediaTable.id, ids));

      return commonRes(media, 200, "获取图片url列表成功");
    },
    {
      query: t.Object({
        ids: t.Array(t.Number()),
      }),
    }
  );
