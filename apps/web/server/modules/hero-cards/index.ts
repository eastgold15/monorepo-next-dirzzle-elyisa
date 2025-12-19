import { heroCardsTable } from "@repo/contract/table";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { dbPlugin } from "@/server/db/connection";
import { localeMiddleware } from "@/server/plugins/locale";
import { commonRes } from "@/server/utils/Res";

export const heroCardsRoute = new Elysia({ prefix: "hero-cards" })
  .use(localeMiddleware)
  .use(dbPlugin)
  .get(
    "/current",
    async ({ db }) => {
      const heroCards = await db
        .select()
        .from(heroCardsTable)
        .where(eq(heroCardsTable.isActive, true))
        .orderBy(heroCardsTable.sortOrder)
        .limit(3);

      return commonRes(heroCards, 200, "获取 Hero Cards 成功");
    },
    {
      detail: {
        tags: ["Hero Cards"],
        summary: "获取当前有效的 Hero Cards",
        description: "获取首页展示的营销卡片",
      },
    }
  );
