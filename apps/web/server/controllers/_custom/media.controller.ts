import Elysia, { t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { localeMiddleware } from "~/middleware/locale";
import { siteMiddleware } from "~/middleware/site";
import { mediaService } from "~/modules";
export const mediaController = new Elysia({ prefix: "/media" }) // 获取图片 - 前端用户使用
  .use(localeMiddleware)
  .use(dbPlugin)
  .use(siteMiddleware)
  /**
   * 获取单个图片 URL
   */
  .get(
    "/url/:id",
    async ({ db, siteId, params: { id } }) =>
      await mediaService.getUrlById(id, { db, siteId }),
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ["Media"],
        summary: "获取单个媒体文件URL",
        description: "根据媒体ID获取对应的访问URL",
      },
    }
  )
  /**
   * 批量获取图片 URL 列表
   */
  .get(
    "/urls",
    async ({ db, siteId, query: { ids } }) =>
      await mediaService.getUrlsByIds(ids, { db, siteId }),
    {
      query: t.Object({
        ids: t.Array(t.String()),
      }),
      detail: {
        tags: ["Media"],
        summary: "批量获取媒体URL列表",
        description: "根据多个媒体ID批量获取对应的访问URL列表",
      },
    }
  );
