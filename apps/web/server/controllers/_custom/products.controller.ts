import { ProductsContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { localeMiddleware } from "~/middleware/locale";
import { siteMiddleware } from "~/middleware/site";
import { productsService } from "~/modules";
import { buildPageMeta } from "~/utils/services/pagination";

export const productsController = new Elysia({ prefix: "/products" })
  .use(localeMiddleware)
  .use(dbPlugin)
  .use(siteMiddleware)
  .get(
    "/",
    async ({ db, siteId, query }) => {
      const { page = 1, limit = 10 } = query;

      const { data, total } = await productsService.list(query, { db, siteId });

      return {
        items: data,
        meta: buildPageMeta(total, page, limit),
      };
    },
    {
      query: ProductsContract.ListQuery,
      detail: {
        tags: ["Products"],
        summary: "获取商品列表",
        description: "分页获取当前站点的商品列表，支持按分类、名称等条件筛选",
      },
    }
  )
  .get(
    "/:id",
    async ({ params: { id }, db, siteId }) =>
      await productsService.getDetail(id, { db, siteId }),
    {
      params: t.Object({ id: t.String() }),
      detail: {
        tags: ["Products"],
        summary: "获取商品详情",
        description: "根据商品ID获取详细的商品信息，包括价格、描述、图片等",
      },
    }
  );
