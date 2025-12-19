# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Bun + Turborepo 的现代化全栈电商项目，采用 Elysia 后端框架和 Next.js 前端框架。
## 常用规则

Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.


"当处理 API 相关逻辑时，必须先检查 packages/contracts。禁止在 apps/ 目录下自创 Interface，必须复用共享契约。"


> **AI 行为规范：**
> 1. 在处理 `apps/b2badmin` 下的任何 API 调用或表单组件时，**必须**先阅读根目录下的 `AI_API_REFERENCE.md`。
> 2. 所有 API 调用都必须符合 `packages/contract/src/modules/generated` 目录下的契约定义。
> 3. 前端表单组件的 `name` 属性必须与契约中定义的字段名一致。

项目工程规范：

数据源头：一切以 src/table.schema.ts 为准。

契约使用：禁止手动编写 API 的 interface。必须通过 import { XxxContract } from "@/modules" 访问契约，通过 XxxDTO 访问类型。

业务逻辑：基础 CRUD 必须使用 src/modules/services/generated 下的自动生成实例。

扩展逻辑：如果需要复杂逻辑，请在 src/modules/custom/ 下创建同名 .contract.ts 文件，脚本会自动切换路由引用。


 1. 自动化契约生成系统

  - 脚本从 table.schema.ts 的数据库表定义自动生成所有契约
  - 生成的契约包含标准的 CRUD 类型定义（Response, Create, Update, Patch, ListQuery, ListResponse）
  - 支持 custom/ 目录覆盖自动生成的契约，实现业务扩展

  2. 多租户架构设计

  从 table.schema.ts 发现了完整的租户隔离机制：
  export const tenantCols = {
    exporterId: p.uuid("exporter_id").references(() => exportersTable.id),  // 出口商
    factoryId: p.uuid("factory_id").references(() => factoriesTable.id),    // 工厂
    ownerId: p.uuid("owner_id").references(() => usersTable.id),            // 业务员
    isPublic: p.boolean("is_public").default(false),                        // 公海数据
  }

  3. 实体关系图谱

  发现了核心的业务关系链：
  出口商 (exporters)
      ↓ 1:N
  工厂 (factories)
      ↓
  用户 (users) ↔ 角色 (roles) ↔ 权限 (permissions)
      ↓
  站点 (sites) → 分类 (categories) → 产品 (products) → SKU → 媒体
      ↓
  询价 (inquiry) → 询价项目 (inquiryItems) → 报价 (quotations)

  4. 系统的优势

  - 类型安全：使用 drizzle-typebox 确保前后端类型一致
  - 标准化：所有契约遵循统一结构
  - 可扩展：通过 custom 目录支持业务定制
  - 自动化：减少手写类型定义的工作量


  先看packages\contract\scripts\gen-all-final.ts 脚本，明白我的意图，基本上运行一次之后，就是我自己手动修改controller中的逻辑了。根据业务需要把controller里面加openapi注释，描述每个接口的功能。 在完成逻辑。

### 根目录命令
- `bun dev` - 启动所有应用的开发服务器
- `bun build` - 构建所有应用

### 数据库命令（在 packages/contract 目录）
- `bun db:push` - 推送 schema 到数据库


## 项目架构

### Monorepo 结构
- `apps/web` - Next.js 前端应用
- `apps/b2badmin` - Elysia 后端 API 应用（也包含前端管理界面）
- `packages/contract` - 共享的类型定义和数据库 Schema
- `packages/tsconfig` - 共享的 TypeScript 配置

### 后端架构（Elysia）

#### 核心技术栈
- **框架**: Elysia (基于 Bun 的高性能 Web 框架)
- **数据库**: PostgreSQL + Drizzle ORM
- **认证**: Better Auth（支持邮箱密码登录和 GitHub OAuth）
- **验证**: Zod
- **API 文档**: OpenAPI (Swagger)
- **文件存储**: 阿里云 OSS + 本地存储

#### 目录结构
```
apps/b2badmin/src/server/
├── modules/          # 业务模块
│   ├── auth/        # 认证模块
│   ├── product/     # 商品管理
│   ├── category/    # 分类管理
│   ├── media/       # 媒体文件管理
│   └── ...
├── db/              # 数据库相关
│   ├── connection.ts
│   └── schema.ts
├── lib/             # 核心库
├── plugins/         # Elysia 插件
└── utils/           # 工具函数
```

#### 模块化设计
每个业务模块通常包含：
- `.ts` - 控制器文件（路由和请求处理）
- `.service.ts` - 服务层文件（业务逻辑）
- 在 `packages/contract/src/modules/` 中对应的 schema 定义

### 前端架构（Next.js）

#### 技术栈
- **框架**: Next.js 16
- **UI**: Tailwind CSS + Radix UI
- **状态管理**: Zustand
- **数据获取**: TanStack Query
- **类型安全**: 通过 @repo/contract 共享后端类型

#### API 集成
使用 `@elysiajs/eden` 实现类型安全的 API 客户端，自动推断后端 API 类型。

### 契约层设计

`packages/contract` 包是整个项目的核心，提供：
- 统一的数据库 Schema 定义（Drizzle）
- 共享的 TypeScript 类型
- 前后端类型安全保障

#### Schema 命名规范
- 使用 `uuid` 作为主键（通过 `idUuid` helper）
- 包含 `createdAt` 和 `updatedAt` 时间戳字段
- 采用 `snake_case` 命名约定

## 重要配置说明

### 认证系统（Better Auth）
- 邮箱密码登录，支持邮箱验证
- GitHub OAuth 集成

### 数据库配置
- 使用 PostgreSQL
- 通过 Drizzle Kit 管理 Schema 迁移
- 数据库连接通过环境变量配置



## 代码规范

- 使用 **Ultracite**（基于 Biome）进行代码格式化和检查
- 严格遵循 TypeScript 类型安全
- 模块化设计，清晰分离关注点

## 开发注意事项

1. **类型共享**：前端通过 `@repo/contract` 直接使用后端定义的类型
2. **API 文档**：访问 `/openapi` 查看自动生成的 API 文档
3. **错误处理**：使用 `elysia-http-problem-json` 插件统一错误响应格式
4. **日志记录**：集成 `logixlysia` 插件进行请求日志记录
5. **CORS 配置**：已配置允许前端开发服务器跨域访问
- b2bAdmin 是后台管理端， web是面向用户的网站
- 开发流程，现在契约层的schema文件，知道数据库长什么样，在看契约层model文件，前后端的类型都从这里来，然后看前端页面需要什么数据，开始后端书写前端需要的接口

- 数据库改变，只准运行bun db:push，有问题就重置数据库
- 数据库使用远程数据库


- 前后端的类型都定义到契约层，这是必须！！！！！


```
实体关系图 出口商 (exportersTable)
    ↓ (1:N)
工厂 (factoriesTable) - 每个工厂属于一个出口商
    ↓
用户 (usersTable) - 通过 userResourceRolesTable 关联

用户 (usersTable)
    ↓ (1:N)
userResourceRolesTable - 用户资源角色关联表
    ↓ (N:1)
角色 (roleTable)
```

- 更多实体信息请看 [实体关系图](./docs/实体.md)

- 当前项目状态 请看 [项目状态](./docs/status.md)

# 最重要的部分
- 项目开发方式，先看 `packages\contract\src\modules` 目录下的文件，这里定义了数据库的 schema，以及前后端的类型定义，再去 `apps\b2badmin\src\server\modules` 完成elysia的逻辑，先写 
```ts
export const [xxx]Route = new Elysia({
  prefix: "[xxx]",
  tags: ["[xxx]"],
})
  .use(dbPlugin)
  .use(betterAuthPlugin)
  .post(
    "[/xxx]",
    async ({ body, userInfo, db }) => {
    
    },
    {
      auth: true,
      body: [来自契约层的类型],
      detail: {
        summary: "[xxx]",
        description: "[xxx]",
      },
    }
  )
```
这样一个接口描述好了，再去完成里面的逻辑


- 以后创建新的 API hooks 时，应该放在 /hooks/api/ 文件夹中
- 文件名应该与 server/modules 中的模块名对应
- UI 相关的 hooks 放在 /hooks/ui/ 文件夹中