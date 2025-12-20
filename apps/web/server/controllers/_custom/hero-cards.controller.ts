import { heroCardsTable } from "@repo/contract/table";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { dbPlugin } from "~/db/connection";
import { localeMiddleware } from "~/middleware/locale";
import { siteMiddleware } from "~/middleware/site";
export const heroCardsController = new Elysia({ prefix: "/hero-cards" })
  .use(localeMiddleware)
  .use(dbPlugin)
  .use(siteMiddleware)
  .get(
    "/current",
    async ({ db }) => {
      const heroCards = await db
        .select()
        .from(heroCardsTable)
        .where(eq(heroCardsTable.isActive, true))
        .orderBy(heroCardsTable.sortOrder)
        .limit(3);

      return heroCards;
    },
    {
      detail: {
        tags: ["Hero Cards"],
        summary: "获取当前有效的 Hero Cards",
        description: "获取首页展示的营销卡片",
      },
    }
  );
