// Exporters module contract - 自定义扩展
// 用于出口商管理

import { t } from "elysia";
// 1. 导入自动生成的原始契约
import { ExportersContract as Generated } from "../_generated/exporters.contract";

/**
 * 自定义扩展契约：Exporters
 * 模式：继承基础字段 + 叠加复杂逻辑
 */

// --- A. 扩展响应结构 (最常用：增加关联数据) ---
const CustomResponse = t.Composite([
  Generated.Response, // 保持数据库字段同步
  t.Object({
    // 在这里添加关联字段，例如：
    // factories: t.Array(FactoriesContract.Response),
    // manager: t.Optional(UsersContract.Response),
    // sites: t.Array(SitesContract.Response),
    // factoryCount: t.Number(),
    // siteCount: t.Number(),
    // userCount: t.Number(),
    // activeOrders: t.Number(),
    // totalRevenue: t.Number(),
    // certifications: t.Array(t.String()),
    // exportMarkets: t.Array(t.String()),
    // paymentMethods: t.Array(t.String()),
    // shippingMethods: t.Array(t.String()),
    // businessLicense: t.Optional(t.String()),
    // establishedYear: t.Optional(t.Number()),
    // annualRevenue: t.Optional(t.Object({
    //   amount: t.Number(),
    //   currency: t.String(),
    //   year: t.Number(),
    // })),
  }),
]);

// --- B. 扩展创建请求 (例如：增加前端特有的校验) ---
const CustomCreate = t.Composite([
  Generated.Create,
  t.Object({
    // 例如：增加"认证信息"和"出口市场"这些额外的业务字段
    certifications: t.Optional(t.Array(t.String())),
    exportMarkets: t.Optional(t.Array(t.String())),
    paymentMethods: t.Optional(t.Array(t.String())),
    shippingMethods: t.Optional(t.Array(t.String())),
    businessLicense: t.Optional(t.String()),
    establishedYear: t.Optional(t.Number({ minimum: 1800 })),
    annualRevenue: t.Optional(
      t.Object({
        amount: t.Number({ minimum: 0 }),
        currency: t.String(),
        year: t.Number({ minimum: 2000 }),
      })
    ),
    // website: t.Optional(t.String({ format: "uri" })),
    // description: t.Optional(t.String()),
    // logo: t.Optional(t.String()),
    // contactPerson: t.Object({
    //   name: t.String(),
    //   title: t.String(),
    //   email: t.String({ format: "email" }),
    //   phone: t.String(),
    // }),
  }),
]);

// --- C. 自定义业务类型 ---
// 出口商查询参数
const ExporterQuery = t.Object({
  country: t.Optional(t.String()),
  province: t.Optional(t.String()),
  city: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
  hasCertifications: t.Optional(t.Boolean()),
  exportMarkets: t.Optional(t.Array(t.String())),
  paymentMethods: t.Optional(t.Array(t.String())),
  search: t.Optional(t.String()),
  sortBy: t.Optional(
    t.UnionEnum([
      "createdAt",
      "updatedAt",
      "name",
      "code",
      "factories",
      "revenue",
    ])
  ),
  sortOrder: t.Optional(t.UnionEnum(["asc", "desc"])),
});

// 出口商状态更新
const ExporterStatusUpdate = t.Object({
  exporterId: t.String(),
  isActive: t.Boolean(),
  reason: t.Optional(t.String()),
});

// 出口商认证管理
const ExporterCertification = t.Object({
  exporterId: t.String(),
  certificationType: t.String(),
  certificationNumber: t.String(),
  issuedBy: t.String(),
  issuedDate: t.String({ format: "date" }),
  expiryDate: t.Optional(t.String({ format: "date" })),
  certificateUrl: t.Optional(t.String()),
  status: t.UnionEnum([
    "pending",
    "verified",
    "expired"
  ]),
});

// 出口商统计
const ExporterStats = t.Object({
  totalExporters: t.Number(),
  activeExporters: t.Number(),
  inactiveExporters: t.Number(),
  certifiedExporters: t.Number(),
  countryDistribution: t.Array(
    t.Object({
      country: t.String(),
      count: t.Number(),
      percentage: t.Number(),
    })
  ),
  marketDistribution: t.Array(
    t.Object({
      market: t.String(),
      count: t.Number(),
    })
  ),
  sizeDistribution: t.Array(
    t.Object({
      size: t.UnionEnum([
        "small",
        "medium",
        "large",
      ]),
      count: t.Number(),
    })
  ),
  recentRegistrations: t.Number(),
  topPerformers: t.Array(
    t.Object({
      exporterId: t.String(),
      name: t.String(),
      orders: t.Number(),
      revenue: t.Number(),
      factories: t.Number(),
    })
  ),
});

// 出口商审核
const ExporterVerification = t.Object({
  exporterId: t.String(),
  status: t.UnionEnum([
    "pending",
    "approved",
    "rejected",
  ]),
  verifiedBy: t.Optional(t.String()),
  verifiedAt: t.Optional(t.String({ format: "date-time" })),
  comments: t.String(),
  documents: t.Optional(
    t.Array(
      t.Object({
        type: t.String(),
        url: t.String(),
        name: t.String(),
      })
    )
  ),
});

// --- D. 组装并导出 ---
export const ExportersContract = {
  ...Generated, // 默认继承所有：Update, Patch, ListQuery
  Response: CustomResponse, // 覆盖为自定义详情响应
  Create: CustomCreate, // 覆盖为自定义创建请求
  ListQuery: ExporterQuery, // 覆盖为自定义查询

  // 自定义业务类型
  ExporterQuery,
  ExporterStatusUpdate,
  ExporterCertification,
  ExporterStats,
  ExporterVerification,
} as const;

// --- E. 导出 DTO 类型给前端使用 ---
export type ExportersDTO = {
  Response: typeof ExportersContract.Response.static;
  Create: typeof ExportersContract.Create.static;
  Update: typeof Generated.Update.static; // 未修改的直接透传
  Patch: typeof Generated.Patch.static;
  ListQuery: typeof ExportersContract.ListQuery.static;
  ListResponse: typeof Generated.ListResponse.static & {
    // 如果列表也需要扩展，可以在这里交叉类型
  };

  // 自定义类型
  ExporterQuery: typeof ExportersContract.ExporterQuery.static;
  ExporterStatusUpdate: typeof ExportersContract.ExporterStatusUpdate.static;
  ExporterCertification: typeof ExportersContract.ExporterCertification.static;
  ExporterStats: typeof ExportersContract.ExporterStats.static;
  ExporterVerification: typeof ExportersContract.ExporterVerification.static;
};
