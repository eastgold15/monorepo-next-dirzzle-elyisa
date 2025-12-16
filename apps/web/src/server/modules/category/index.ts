import { MasterTable } from "@repo/contract";
import { asc, eq } from "drizzle-orm";
import Elysia, { t } from "elysia";
import { dbPlugin } from "@/server/db/connection";
import { localeMiddleware } from "@/server/plugins/locale";
import { buildTree } from "@/server/utils/buildTree";
import { commonRes } from "@/server/utils/Res";

export const categoryRoute = new Elysia({ prefix: "category" }) // 获取分类树形列表 - 前端用户使用
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

      return commonRes(
        buildTree(categories, "id", "parentId"),
        200,
        "获取分类树形列表成功"
      );
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
      return commonRes(res[0], 200, "获取分类成功");
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );
