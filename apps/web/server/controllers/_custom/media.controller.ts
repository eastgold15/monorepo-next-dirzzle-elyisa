import { mediaTable } from "@repo/contract/table";
import { asc, eq, inArray } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { localeMiddleware } from "~/middleware/locale";
import { siteMiddleware } from "~/middleware/site";
export const mediaController = new Elysia({ prefix: "/media" }) // 获取图片 - 前端用户使用
  .use(localeMiddleware)
  .use(dbPlugin)
  .use(siteMiddleware)
  .get(
    "/url/:id",
    async ({ locale, db, params: { id } }) => {
      console.log("获取分类树形列表，当前语言:", locale);
      const media = await db
        .select()
        .from(mediaTable)
        .where(eq(mediaTable.id, id))
        .orderBy(asc(mediaTable.createdAt));

      return media[0].url;
    },
    {
      params: t.Object({
        id: t.String(),
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

      return media;
    },
    {
      query: t.Object({
        ids: t.Array(t.String()),
      }),
    }
  );
