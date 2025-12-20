// Sites module contract - 自定义扩展
// 用于站点管理

import { t } from "elysia";
// 1. 导入自动生成的原始契约
import { SitesContract as Generated } from "../_generated/sites.contract";
import { UsersContract } from "../_generated/users.contract";
import { FactoriesContract } from "../_generated/factories.contract";
import { ExportersContract } from "../_generated/exporters.contract";

/**
 * 自定义扩展契约：Sites
 * 模式：继承基础字段 + 叠加复杂逻辑
 */

// --- A. 扩展响应结构 (最常用：增加关联数据) ---
const CustomResponse = t.Composite([
  Generated.Response, // 保持数据库字段同步
  t.Object({
    // 在这里添加关联字段，例如：
    // factory: t.Optional(FactoriesContract.Response),
    // exporter: t.Optional(ExportersContract.Response),
    // adminUsers: t.Array(UsersContract.Response),
    // userCount: t.Number(),
    // productCount: t.Number(),
    // inquiryCount: t.Number(),
    // lastActivityAt: t.Optional(t.String()),
    // settings: t.Object({}, { additionalProperties: true }),
    // theme: t.Object({
    //   primaryColor: t.String(),
    //   logo: t.Optional(t.String()),
    //   favicon: t.Optional(t.String()),
    // }),
    // features: t.Array(t.String()),
    // domainSettings: t.Object({
    //   customDomain: t.Optional(t.String()),
    //   sslEnabled: t.Boolean(),
    //   cdnEnabled: t.Boolean(),
    // }),
  }),
]);

// --- B. 扩展创建请求 (例如：增加前端特有的校验) ---
const CustomCreate = t.Composite([
  Generated.Create,
  t.Object({
    // 例如：增加"管理员设置"和"站点配置"这些额外的业务字段
    adminEmails: t.Array(t.String({ format: "email" })),
    settings: t.Optional(t.Object({}, { additionalProperties: true })),
    template: t.Optional(t.String()),
    // features: t.Optional(t.Array(t.String())),
    // domainSettings: t.Optional(t.Object({
    //   customDomain: t.Optional(t.String()),
    //   enableSSL: t.Boolean(),
    // })),
  }),
]);

// --- C. 自定义业务类型 ---
// 站点查询参数
const SiteQuery = t.Object({
  factoryId: t.Optional(t.String()),
  exporterId: t.Optional(t.String()),
  type: t.Optional(t.Union([
    t.Literal("b2b"),
    t.Literal("b2c"),
    t.Literal("marketplace"),
  ])),
  status: t.Optional(t.Union([
    t.Literal("active"),
    t.Literal("inactive"),
    t.Literal("suspended"),
  ])),
  domain: t.Optional(t.String()),
  search: t.Optional(t.String()),
  hasCustomDomain: t.Optional(t.Boolean()),
  sortBy: t.Optional(t.Union([
    t.Literal("createdAt"),
    t.Literal("updatedAt"),
    t.Literal("name"),
    t.Literal("domain"),
    t.Literal("status"),
  ])),
  sortOrder: t.Optional(t.Union([t.Literal("asc"), t.Literal("desc")])),
});

// 站点用户管理
const SiteUserManagement = t.Object({
  siteId: t.String(),
  userIds: t.Array(t.String()),
  action: t.Union([
    t.Literal("add"),
    t.Literal("remove"),
    t.Literal("changeRole"),
  ]),
  role: t.Optional(t.Union([
    t.Literal("admin"),
    t.Literal("editor"),
    t.Literal("viewer"),
  ])),
});

// 站点配置更新
const SiteConfigUpdate = t.Object({
  siteId: t.String(),
  config: t.Object({
    // 通用设置
    siteName: t.Optional(t.String()),
    description: t.Optional(t.String()),
    keywords: t.Optional(t.Array(t.String())),
    logo: t.Optional(t.String()),
    favicon: t.Optional(t.String()),

    // 主题设置
    theme: t.Optional(t.Object({
      primaryColor: t.String(),
      secondaryColor: t.String(),
      fontFamily: t.String(),
      layout: t.Union([t.Literal("modern"), t.Literal("classic"), t.Literal("minimal")]),
    })),

    // 功能开关
    features: t.Optional(t.Object({
      enableInquiry: t.Boolean(),
      enableQuotation: t.Boolean(),
      enableRegistration: t.Boolean(),
      enableMultiLanguage: t.Boolean(),
      enableAnalytics: t.Boolean(),
    })),

    // 域名设置
    domain: t.Optional(t.Object({
      customDomain: t.Optional(t.String()),
      enableSSL: t.Boolean(),
      enableCDN: t.Boolean(),
    })),

    // 邮件设置
    email: t.Optional(t.Object({
      senderName: t.String(),
      senderEmail: t.String({ format: "email" }),
      replyTo: t.Optional(t.String({ format: "email" })),
    })),

    // 其他设置
    maintenance: t.Optional(t.Object({
      enabled: t.Boolean(),
      message: t.String(),
    })),
  }),
});

// 站点统计
const SiteStats = t.Object({
  totalSites: t.Number(),
  activeSites: t.Number(),
  inactiveSites: t.Number(),
  suspendedSites: t.Number(),
  factoryDistribution: t.Array(t.Object({
    factoryId: t.String(),
    factoryName: t.String(),
    siteCount: t.Number(),
  })),
  typeDistribution: t.Array(t.Object({
    type: t.String(),
    count: t.Number(),
  })),
  recentActivity: t.Array(t.Object({
    siteId: t.String(),
    siteName: t.String(),
    activity: t.String(),
    timestamp: t.String({ format: "date-time" }),
  })),
  topPerformers: t.Array(t.Object({
    siteId: t.String(),
    siteName: t.String(),
    inquiries: t.Number(),
    visitors: t.Number(),
  })),
});

// 站点克隆
const CloneSiteRequest = t.Object({
  sourceSiteId: t.String(),
  newName: t.String(),
  newDomain: t.Optional(t.String()),
  cloneContent: t.Boolean(),
  cloneSettings: t.Boolean(),
  cloneUsers: t.Boolean(),
});

// --- D. 组装并导出 ---
export const SitesContract = {
  ...Generated, // 默认继承所有：Update, Patch, ListQuery
  Response: CustomResponse, // 覆盖为自定义详情响应
  Create: CustomCreate, // 覆盖为自定义创建请求
  ListQuery: SiteQuery, // 覆盖为自定义查询

  // 自定义业务类型
  SiteQuery,
  SiteUserManagement,
  SiteConfigUpdate,
  SiteStats,
  CloneSiteRequest,
} as const;

// --- E. 导出 DTO 类型给前端使用 ---
export type SitesDTO = {
  Response: typeof SitesContract.Response.static;
  Create: typeof SitesContract.Create.static;
  Update: typeof Generated.Update.static; // 未修改的直接透传
  Patch: typeof Generated.Patch.static;
  ListQuery: typeof SitesContract.ListQuery.static;
  ListResponse: typeof Generated.ListResponse.static & {
    // 如果列表也需要扩展，可以在这里交叉类型
  };

  // 自定义类型
  SiteQuery: typeof SitesContract.SiteQuery.static;
  SiteUserManagement: typeof SitesContract.SiteUserManagement.static;
  SiteConfigUpdate: typeof SitesContract.SiteConfigUpdate.static;
  SiteStats: typeof SitesContract.SiteStats.static;
  CloneSiteRequest: typeof SitesContract.CloneSiteRequest.static;
};