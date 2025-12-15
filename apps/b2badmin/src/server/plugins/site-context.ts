import type { ExporterTModel, FactoryTModel, SiteTModel } from "@repo/contract";
import {
  type exportersTable,
  type factoriesTable,
  sitesTable,
} from "@repo/contract/table";

import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { dbPlugin } from "../db/connection";

export interface SiteContext {
  site: SiteTModel["Select"];
  siteType: "factory" | "exporter";
  entityId: string;
  entity?: FactoryTModel["Select"] | ExporterTModel["Select"];
}

export const siteContextMiddleware = new Elysia({
  name: "site-context",
})
  .use(dbPlugin)
  .derive(async ({ request, headers, query, db }) => {
    // 获取站点标识符的优先级：
    // 1. 请求头中的 X-Site-ID（最高优先级）
    // 2. 查询参数中的 site_id
    // 3. 请求头中的 Host（域名识别）
    // 4. 环境变量中的站点ID（开发环境备用）

    // @ts-expect-error
    let siteId = headers.get("x-site-id") || (query?.site_id as string);

    if (!siteId) {
      // 尝试从域名识别
      const host = request?.headers?.get("host") || headers.host;
      if (host) {
        // 从域名中提取站点
        const site = await db
          .select()
          .from(sitesTable)
          .where(eq(sitesTable.domain, host))
          .limit(1);

        if (site.length > 0) {
          siteId = site[0].id;
        }
      }
    }

    if (!siteId) {
      // 最后尝试环境变量（仅开发环境）
      siteId = process.env.DEFAULT_SITE_ID!;
    }

    if (!siteId) {
      throw new Error("Site ID is required");
    }

    // 1. 获取站点信息
    const site = await db.query.sitesTable.findFirst({
      where: {
        id: siteId,
      },
    });

    if (!site) {
      throw new Error(`Site not found: ${siteId}`);
    }

    const siteData = site;

    if (!siteData.isActive) {
      throw new Error(`Site is not active: ${siteId}`);
    }

    // 2. 根据站点类型获取关联实体
    let entity;
    if (siteData.siteType === "factory") {
      const factories = await db.query.factoriesTable.findFirst({
        where: {
          id: siteData.entityId,
        },
      });

      entity = factories;
    } else if (siteData.siteType === "exporter") {
      const exporters = await db.query.exportersTable.findFirst({
        where: {
          id: siteData.entityId,
        },
      });
      entity = exporters;
    }

    if (!entity) {
      throw new Error(`Entity not found for site: ${siteId}`);
    }

    return {
      siteContext: {
        site: siteData,
        siteType: siteData.siteType,
        entityId: siteData.entityId,
        entity,
      } as SiteContext,
    };
  });

// 辅助函数：检查是否为工厂站点
export function isFactorySite(context: SiteContext): context is SiteContext & {
  siteType: "factory";
  entity: typeof factoriesTable.$inferSelect;
} {
  return context.siteType === "factory";
}

// 辅助函数：检查是否为出口商站点
export function isExporterSite(context: SiteContext): context is SiteContext & {
  siteType: "exporter";
  entity: typeof exportersTable.$inferSelect;
} {
  return context.siteType === "exporter";
}
