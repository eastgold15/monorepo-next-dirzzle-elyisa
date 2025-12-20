import { Elysia } from "elysia";
import { dbPlugin } from "~/db/connection";
import { localeMiddleware } from "~/middleware/locale";
import { siteMiddleware } from "~/middleware/site";
import { heroCardsService } from "~/modules";
export const herocardsController = new Elysia({ prefix: "/herocards" })
  .use(localeMiddleware)
  .use(dbPlugin)
  .use(siteMiddleware)
  .get(
    "/current",
    async ({ db, siteId }) =>
      await heroCardsService.findCurrent({ db, siteId }),
    {
      detail: {
        tags: ["Hero Cards"],
        summary: "获取首页展示卡片",
        description:
          "获取当前站点激活的首页展示卡片，用于突出显示重要内容或营销活动",
      },
    }
  );
