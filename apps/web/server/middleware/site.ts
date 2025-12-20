import Elysia from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "../db/connection";

/**
 * 站点中间件 - 根据域名查找站点ID并注入上下文
 */
export const siteMiddleware = new Elysia({ name: "site-middleware" })
  .use(dbPlugin)
  .derive(async ({ db, request }) => {
    // 从请求头获取域名
    const hostname = request.headers.get("host") || "localhost";
    console.log("hostname:", hostname);

    // 移除端口号（如果存在）
    const domain = hostname.split(":")[0];
    console.log("domain:", domain);

    // 查找对应的站点
    const site = await db.query.sitesTable.findFirst({
      where: {
        domain,
      },
      columns: {
        id: true,
        name: true,
        siteType: true,
        factoryId: true,
        exporterId: true,
        isActive: true,
      },
    });

    console.log("site:", site);

    if (!site) {
      throw new HttpError.NotFound(`Site not found for domain: ${domain}`);
    }

    if (!site.isActive) {
      throw new HttpError.Forbidden(`Site is not active: ${domain}`);
    }
    const {
      id: siteId,
      name: siteName,
      siteType,
      factoryId,
      exporterId,
    } = site;

    return {
      siteId,
      siteName,
      siteType,
      /** 工厂和出口商id*/
      tenantId: factoryId ?? (exporterId as string),
    };
  })
  .as("global");
