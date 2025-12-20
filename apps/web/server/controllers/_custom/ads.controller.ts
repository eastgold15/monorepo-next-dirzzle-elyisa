import { Elysia } from "elysia";
import { dbPlugin } from "~/db/connection";
import { localeMiddleware } from "~/middleware/locale";
import { siteMiddleware } from "~/middleware/site";
import { adsService } from "~/modules";

export const adsController = new Elysia({ prefix: "/ads" })
  .use(localeMiddleware)
  .use(dbPlugin)
  .use(siteMiddleware)
  // 自定义路由：获取当前有效广告
  .get(
    "/current",
    async ({ db, siteId }) => adsService.findCurrent({ db, siteId }),
    {
      detail: {
        tags: ["Advertisements"],
        summary: "获取当前有效广告",
        description:
          "获取当前站点在有效时间段内的广告列表，用于首页展示和推广位填充",
      },
    }
  );
