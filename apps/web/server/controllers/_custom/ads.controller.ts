import { adsTable } from "@repo/contract/table";
import { and, eq, gte, lte } from "drizzle-orm";
import { Elysia } from "elysia";
import { dbPlugin } from "~/db/connection";
import { localeMiddleware } from "~/middleware/locale";
import { siteMiddleware } from "~/middleware/site";

export const adsController = new Elysia({ prefix: "/ads" })
  .use(localeMiddleware)
  .use(dbPlugin)
  .use(siteMiddleware)
  // 自定义路由：获取当前有效广告
  .get(
    "/current",
    async ({ db }) => {
      const now = new Date();

      const ads = await db
        .select()
        .from(adsTable)
        .where(
          and(
            eq(adsTable.isActive, true),
            lte(adsTable.startDate, now),
            gte(adsTable.endDate, now)
          )
        )
        .limit(4);

      return ads;
    },
    {
      detail: {
        tags: ["Advertisements"],
        summary: "获取当前有效广告",
        description: "获取当前时间段内有效的广告",
      },
    }
  );
