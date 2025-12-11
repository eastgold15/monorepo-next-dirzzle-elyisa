# CLAUDE.md

## 项目规范
- 我喜欢给文件加上注释来描述他的作用和关键用处，通过新建一个同名文件修改后缀为md来解释同名文件
- 你可以更具我的描述来修改代码

## Project Overview

这是一个基于 Bun + Turborepo 的现代化全栈电商项目

**项目架构详情**: [项目架构总览](doc/architecture.md)

## Development Environment

### 包管理器
- **项目使用 Bun 作为包管理器**（严格遵循用户配置）
- 优先使用 `bun` 进行依赖管
- 代码格式化使用 **Ultracite**（零配置 Biome 预设）

### 常用命令



## 技术栈

### 后端技术栈
- **框架**: Elysia (基于 Bun 的高性能 Web 框架)
- **数据库**: PostgreSQL + Drizzle ORM（类型安全的 ORM）
- **认证**: Better Auth + @pori15/elysia-auth-drizzle（邮箱 OTP 登录）

- **API 文档**: OpenAPI (Swagger) 自动生成
- **文件存储**: AWS S3 + 本地存储
- **代码规范**: Ultracite（Biome 严格预设）

