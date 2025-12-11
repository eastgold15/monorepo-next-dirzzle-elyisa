import { adsTable } from "@repo/contract/table";
import { and, eq, gte, lte } from "drizzle-orm";
import { Elysia } from "elysia";
import { dbPlugin } from "@/server/db/connection";
import { localeMiddleware } from "@/server/plugins/locale";
import { commonRes } from "@/server/utils/Res";

export const adsRoute = new Elysia({ prefix: "ads" })
  .use(localeMiddleware)
  .use(dbPlugin)
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

      return commonRes(ads, 200, "获取当前广告成功");
    },
    {
      detail: {
        tags: ["Advertisements"],
        summary: "获取当前有效广告",
        description: "获取当前时间段内有效的广告",
      },
    }
  );
