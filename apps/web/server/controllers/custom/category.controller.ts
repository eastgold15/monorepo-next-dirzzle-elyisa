import { MasterTable } from "@repo/contract";
import { asc, eq } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { localeMiddleware } from "~/plugins/locale";
import { buildTree } from "~/utils/buildTree";

export const categoryController = new Elysia({ prefix: "/category" }) // 获取分类树形列表 - 前端用户使用
  .use(localeMiddleware)
  .use(dbPlugin)
  .get(
    "/",
    async ({ locale, db }) => {
      console.log("获取分类树形列表，当前语言:", locale);
      const categories = await db
        .select()
        .from(MasterTable)
        .orderBy(asc(MasterTable.sortOrder));

      return buildTree(categories, "id", "parentId");
    },
    {
      detail: {
        tags: ["Categories"],
        summary: "获取分类树形列表",
        description:
          "获取所有分类的树形结构列表，支持搜索和筛选，主要用于管理端。会根据Accept-Language头部返回对应语言的内容。",
      },
    }
  )
  .get(
    "/:id",
    async ({ params: { id }, db }) => {
      // 获取单个分类 - 前端用户使用
      const res = await db
        .select({ des: MasterTable.description })
        .from(MasterTable)
        .where(eq(MasterTable.id, id));
      return res[0];
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );