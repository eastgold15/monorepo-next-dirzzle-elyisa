# 环境变量配置指南

## 项目说明

本项目包含两个主要应用：
- **Web 项目** (`apps/web`) - 面向用户的网站
- **B2B Admin 项目** (`apps/b2badmin`) - 后台管理系统

## 环境配置文件

每个项目都有三个环境配置文件：
- `.env` - 默认环境变量（已存在，包含开发环境的本地配置）
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

## 数据库配置

### 开发环境（本地）
- 使用本地 PostgreSQL 数据库
- 连接信息：`postgres://gina_user:gina_password@localhost:5432/gina_dev`
- 需要先创建本地数据库和用户

```sql
-- 创建用户
CREATE USER gina_user WITH PASSWORD 'gina_password';

-- 创建数据库
CREATE DATABASE gina_dev OWNER gina_user;

-- 授权
GRANT ALL PRIVILEGES ON DATABASE gina_dev TO gina_user;
```

### 生产环境（服务器）
- 使用远程 PostgreSQL 数据库
- 连接信息：`postgres://user_yDBAhF:password_FXwrTE@139.196.30.42:5432/gina`

## 使用方法

### 开发环境
1. 复制 `.env.development` 到 `.env`：
   ```bash
   cp .env.development .env
   ```
2. 根据需要修改 `.env` 中的配置
3. 启动开发服务器

### 生产环境部署
1. 复制 `.env.production` 到 `.env`：
   ```bash
   cp .env.production .env
   ```
2. **重要**：修改以下敏感信息：
   - `SECRET` 和 `BETTER_AUTH_SECRET`：生成新的强密码
   - `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET`：在 GitHub 申请生产环境的 OAuth 应用
   - `APP_HOST` 和 `APP_URL`：改为实际的生产域名
   - 其他敏感配置（如数据库密码）

## 关键配置说明

### Better Auth 配置
- `BETTER_AUTH_URL`：认证服务的完整 URL
- `BETTER_AUTH_SECRET`：用于签名 JWT 和 session 的密钥

### GitHub OAuth
需要从 GitHub Developer Settings 创建 OAuth 应用：
- 开发环境：`http://localhost:3000` (web) 或 `http://localhost:4000` (b2badmin)
- 生产环境：你的实际域名

### 邮件服务
当前使用 163 邮箱 SMTP 服务，如需更换：
- QQ 邮箱：端口 465，需要使用授权码
- 其他邮箱服务：相应调整配置

### 文件存储
- 优先使用阿里云 OSS（`STORAGE_TYPE=oss`）
- 可配置本地存储作为备用（`STORAGE_TYPE=local`）

## 安全注意事项

1. **永远不要**将 `.env` 文件提交到版本控制系统
2. 生产环境必须更改所有默认密钥
3. 使用强密码和随机生成的密钥
4. 定期轮换密钥
5. 启用 HTTPS
6. 对敏感配置使用环境变量或密钥管理服务

## 启动命令

```bash
# 启动所有应用（开发环境）
bun dev

# 构建所有应用
bun build

# 在 packages/contract 目录下推送数据库 schema
bun db:push
```