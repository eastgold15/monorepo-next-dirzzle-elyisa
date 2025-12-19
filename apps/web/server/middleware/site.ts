import { eq } from "drizzle-orm";
import Elysia from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { sitesTable } from "@repo/contract";
import { dbPlugin } from "../db/connection";

/**
 * 站点中间件 - 根据域名查找站点ID并注入上下文
 */
export const siteMiddleware = new Elysia({ name: "site-middleware" })
  .use(dbPlugin)
  .derive(async ({ db, request }) => {
    // 从请求头获取域名
    const hostname = request.headers.get("host") || "localhost";

    // 移除端口号（如果存在）
    const domain = hostname.split(":")[0];

    // 查找对应的站点
    const site = await db.query.sitesTable.findFirst({
      where: eq(sitesTable.domain, domain),
      columns: {
        id: true,
        name: true,
        siteType: true,
        factoryId: true,
        exporterId: true,
        isActive: true,
      },
    });

    if (!site) {
      throw new HttpError.NotFound(`Site not found for domain: ${domain}`);
    }

    if (!site.isActive) {
      throw new HttpError.Forbidden(`Site is not active: ${domain}`);
    }

    return {
      siteId: site.id,
      siteName: site.name,
      siteType: site.siteType,
      factoryId: site.factoryId,
      exporterId: site.exporterId,
    };
  });