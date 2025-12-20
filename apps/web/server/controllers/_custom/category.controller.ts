import { siteCategoriesTable } from "@repo/contract";
import { and, asc, eq } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { localeMiddleware } from "~/middleware/locale";
import { siteMiddleware } from "~/middleware/site";
import { buildTree } from "~/utils/buildTree";

export const categoryController = new Elysia({ prefix: "/category" }) // 获取分类树形列表 - 前端用户使用
  .use(localeMiddleware)
  .use(dbPlugin)
  .use(siteMiddleware)
  .get(
    "/",
    async ({ locale, db, siteId }) => {
      console.log("获取分类树形列表，当前语言:", locale, "站点ID:", siteId);
      // 使用 siteCategories 表来获取站点特定的分类
      const categories = await db
        .select()
        .from(siteCategoriesTable)
        .where(eq(siteCategoriesTable.siteId, siteId))
        .orderBy(asc(siteCategoriesTable.sortOrder));

      return buildTree(categories, "id", "parentId");
    },
    {
      detail: {
        tags: ["Categories"],
        summary: "获取分类树形列表",
        description:
          "获取当前站点的分类树形结构列表，支持搜索和筛选。会根据Accept-Language头部返回对应语言的内容。",
      },
    }
  )
  .get(
    "/:id",
    async ({ params: { id }, db, siteId }) => {
      // 获取单个分类 - 前端用户使用
      const res = await db
        .select()
        .from(siteCategoriesTable)
        .where(
          and(
            eq(siteCategoriesTable.id, id),
            eq(siteCategoriesTable.siteId, siteId)
          )
        );
      return res[0];
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );
