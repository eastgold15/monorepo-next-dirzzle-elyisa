// Factories module contract - 自定义扩展
// 用于工厂管理

import { t } from "elysia";
// 1. 导入自动生成的原始契约
import { FactoriesContract as Generated } from "../_generated/factories.contract";

/**
 * 自定义扩展契约：Factories
 * 模式：继承基础字段 + 叠加复杂逻辑
 */

// --- A. 扩展响应结构 (最常用：增加关联数据) ---
const CustomResponse = t.Composite([
  Generated.Response, // 保持数据库字段同步
  t.Object({
    // 在这里添加关联字段，例如：
    // exporter: t.Optional(ExportersContract.Response),
    // manager: t.Optional(UsersContract.Response),
    // sites: t.Array(SitesContract.Response),
    // userCount: t.Number(),
    // productCount: t.Number(),
    // activeOrders: t.Number(),
    // certifications: t.Array(t.String()),
    // productionCapacity: t.Object({
    //   daily: t.Number(),
    //   monthly: t.Number(),
    //   unit: t.String(),
    // }),
    // specialties: t.Array(t.String()),
    // marketRegions: t.Array(t.String()),
    // establishedYear: t.Optional(t.Number()),
    // employeesCount: t.Optional(t.Number()),
    // revenue: t.Optional(t.Object({
    //   annual: t.Number(),
    //   currency: t.String(),
    // })),
  }),
]);

// --- B. 扩展创建请求 (例如：增加前端特有的校验) ---
const CustomCreate = t.Composite([
  Generated.Create,
  t.Object({
    // 例如：增加"认证信息"和"生产能力"这些额外的业务字段
    certifications: t.Optional(t.Array(t.String())),
    productionCapacity: t.Optional(
      t.Object({
        daily: t.Number({ minimum: 0 }),
        monthly: t.Number({ minimum: 0 }),
        unit: t.String(),
      })
    ),
    specialties: t.Optional(t.Array(t.String())),
    marketRegions: t.Optional(t.Array(t.String())),
    establishedYear: t.Optional(t.Number({ minimum: 1800 })),
    employeesCount: t.Optional(t.Number({ minimum: 1 })),
    // website: t.Optional(t.String({ format: "uri" })),
    // description: t.Optional(t.String()),
    // logo: t.Optional(t.String()),
  }),
]);

// --- C. 自定义业务类型 ---
// 工厂查询参数
const FactoryQuery = t.Object({
  exporterId: t.Optional(t.String()),
  country: t.Optional(t.String()),
  province: t.Optional(t.String()),
  city: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
  hasCertifications: t.Optional(t.Boolean()),
  specialties: t.Optional(t.Array(t.String())),
  marketRegions: t.Optional(t.Array(t.String())),
  employeeRange: t.Optional(
    t.Object({
      min: t.Number({ minimum: 0 }),
      max: t.Number({ minimum: 0 }),
    })
  ),
  search: t.Optional(t.String()),
  sortBy: t.Optional(
    t.UnionEnum(["createdAt", "updatedAt", "name", "code", "employees"])
  ),
  sortOrder: t.Optional(t.UnionEnum(["asc", "desc"])),
});

// 工厂状态更新
const FactoryStatusUpdate = t.Object({
  factoryId: t.String(),
  isActive: t.Boolean(),
  reason: t.Optional(t.String()),
});

// 工厂认证管理
const FactoryCertification = t.Object({
  factoryId: t.String(),
  certificationType: t.String(),
  certificationNumber: t.String(),
  issuedBy: t.String(),
  issuedDate: t.String({ format: "date" }),
  expiryDate: t.Optional(t.String({ format: "date" })),
  certificateUrl: t.Optional(t.String()),
  status: t.UnionEnum(["pending", "verified", "expired"]),
});

// 工厂统计
const FactoryStats = t.Object({
  totalFactories: t.Number(),
  activeFactories: t.Number(),
  inactiveFactories: t.Number(),
  certifiedFactories: t.Number(),
  countryDistribution: t.Array(
    t.Object({
      country: t.String(),
      count: t.Number(),
      percentage: t.Number(),
    })
  ),
  specialtyDistribution: t.Array(
    t.Object({
      specialty: t.String(),
      count: t.Number(),
    })
  ),
  sizeDistribution: t.Array(
    t.Object({
      size: t.UnionEnum(["small", "medium", "large"]),
      count: t.Number(),
    })
  ),
  recentRegistrations: t.Number(),
  topPerformers: t.Array(
    t.Object({
      factoryId: t.String(),
      name: t.String(),
      orders: t.Number(),
      revenue: t.Number(),
      rating: t.Number(),
    })
  ),
});

// 工厂审核
const FactoryVerification = t.Object({
  factoryId: t.String(),
  status: t.UnionEnum(["pending", "approved", "rejected"]),
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
export const FactoriesContract = {
  ...Generated, // 默认继承所有：Update, Patch, ListQuery
  Response: CustomResponse, // 覆盖为自定义详情响应
  Create: CustomCreate, // 覆盖为自定义创建请求
  ListQuery: FactoryQuery, // 覆盖为自定义查询

  // 自定义业务类型
  FactoryQuery,
  FactoryStatusUpdate,
  FactoryCertification,
  FactoryStats,
  FactoryVerification,
} as const;

// --- E. 导出 DTO 类型给前端使用 ---
export type FactoriesDTO = {
  Response: typeof FactoriesContract.Response.static;
  Create: typeof FactoriesContract.Create.static;
  Update: typeof Generated.Update.static; // 未修改的直接透传
  Patch: typeof Generated.Patch.static;
  ListQuery: typeof FactoriesContract.ListQuery.static;
  ListResponse: typeof Generated.ListResponse.static & {
    // 如果列表也需要扩展，可以在这里交叉类型
  };

  // 自定义类型
  FactoryQuery: typeof FactoriesContract.FactoryQuery.static;
  FactoryStatusUpdate: typeof FactoriesContract.FactoryStatusUpdate.static;
  FactoryCertification: typeof FactoriesContract.FactoryCertification.static;
  FactoryStats: typeof FactoriesContract.FactoryStats.static;
  FactoryVerification: typeof FactoriesContract.FactoryVerification.static;
};
