# 环境变量配置指南

## 概述
本项目使用环境变量来管理敏感配置信息。请务必不要将 `.env` 文件提交到版本控制系统。

## 环境变量文件说明

### 1. `.env` - 实际的环境变量文件（不要提交）
包含所有敏感信息，如数据库密码、API密钥等。

### 2. `.env.example` - 环境变量模板文件（可以提交）
提供环境变量的配置模板，不包含实际敏感信息。

## 配置步骤

### Web 应用 (apps/web)
1. 复制 `.env.example` 为 `.env`
   ```bash
   cp apps/web/.env.example apps/web/.env
   ```

2. 编辑 `.env` 文件，填入实际的配置信息：
   - `DATABASE_URL`: PostgreSQL 数据库连接字符串
   - `BETTER_AUTH_SECRET`: Better Auth 的密钥
   - `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET`: GitHub OAuth 应用凭证
   - 邮件服务器配置
   - 阿里云 OSS 配置等

### B2B Admin 应用 (apps/b2badmin)
1. 复制 `.env.example` 为 `.env`
   ```bash
   cp apps/b2badmin/.env.example apps/b2badmin/.env
   ```

2. 编辑 `.env` 文件，填入实际的配置信息。

## 重要提示

⚠️ **安全警告**：
- 绝对不要将 `.env` 文件提交到 Git 或其他版本控制系统
- 生产环境的密钥应该使用安全的密钥管理服务
- 定期轮换敏感密钥
- 使用强密码和随机密钥

## 获取必要的配置信息

### GitHub OAuth
1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 创建新的 OAuth App
3. 获取 Client ID 和 Client Secret
4. 在 Authorization callback URL 中填入: `http://localhost:4000/api/auth/callback/github`

### 阿里云 OSS
1. 登录阿里云控制台
2. 创建 AccessKey
3. 创建 OSS 存储桶
4. 配置跨域规则（如果需要）

### 数据库
- 使用远程 PostgreSQL 数据库
- 确保数据库允许你的 IP 地址访问
- 创建专用的数据库用户和数据库

## 开发环境快速设置

如果你是项目成员，可以从项目负责人那里获取：
- 数据库连接信息
- 共享的测试用 OSS 凭证
- 其他必要的密钥信息