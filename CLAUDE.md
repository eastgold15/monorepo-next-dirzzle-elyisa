# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Bun + Turborepo 的现代化全栈电商项目，采用 Elysia 后端框架和 Next.js 前端框架。

## 开发环境设置



### 2. 环境变量配置
复制并配置相应的环境变量文件（需要阿里云OSS服务和翻译服务的密钥）。

### 3. 启动数据库容器
```bash
cd apps/backend && docker-compose up -d
```

### 4. 启动开发服务器
```bash
bun dev
```

## 常用命令

### 根目录命令
- `bun dev` - 启动所有应用的开发服务器
- `bun build` - 构建所有应用
- `bun check` - 使用 Ultracite 检查代码问题
- `bun fix` - 使用 Ultracite 自动修复代码问题
- `bun check-type` - 类型检查
- `bun clean` - 清理构建文件

### 数据库命令（在 packages/contract 目录）
- `bun db:generate` - 生成数据库迁移文件
- `bun db:migrate` - 执行数据库迁移
- `bun db:push` - 推送 schema 到数据库
- `bun db:studio` - 启动数据库管理界面

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
- Zod 验证 Schema
- 前后端类型安全保障

#### Schema 命名规范
- 使用 `uuid` 作为主键（通过 `idUuid` helper）
- 包含 `createdAt` 和 `updatedAt` 时间戳字段
- 采用 `snake_case` 命名约定

## 重要配置说明

### 认证系统（Better Auth）
- 邮箱密码登录，支持邮箱验证
- GitHub OAuth 集成
- 会话管理：7天过期，24小时更新
- 受信任的来源：localhost:9012, 9013, 3000

### 数据库配置
- 使用 PostgreSQL
- 通过 Drizzle Kit 管理 Schema 迁移
- 数据库连接通过环境变量配置

### 文件存储
- 支持本地存储和阿里云 OSS
- 通过 StorageFactory 模式实现存储策略切换
- 图片处理包含缩略图生成

### 国际化支持
- 支持多语言切换
- 集成阿里云翻译服务
- 使用 locale 中间件处理语言偏好

## 代码规范

- 使用 **Ultracite**（基于 Biome）进行代码格式化和检查
- 严格遵循 TypeScript 类型安全
- 模块化设计，清晰分离关注点
- 使用 Zod 进行运行时类型验证
- 在需要忽略 `noArrayIndexKey` 规则的地方，使用正确的 Biome 忽略语法：`// biome-ignore lint/suspicious/noArrayIndexKey: [具体原因]`

## 开发注意事项

1. **类型共享**：前端通过 `@repo/contract` 直接使用后端定义的类型
2. **API 文档**：访问 `/openapi` 查看自动生成的 API 文档
3. **错误处理**：使用 `elysia-http-problem-json` 插件统一错误响应格式
4. **日志记录**：集成 `logixlysia` 插件进行请求日志记录
5. **CORS 配置**：已配置允许前端开发服务器跨域访问
- b2bAdmin 是后台管理端， web是面向用户的网站
- 开发流程，现在契约层的schema文件，知道数据库长什么样，在看契约层model文件，前后端的类型都从这里来，然后看前端页面需要什么数据，开始后端书写前端需要的接口