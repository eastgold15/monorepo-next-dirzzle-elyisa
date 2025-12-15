# 多站点电商平台架构文档

## 概述

本文档描述了如何在现有的电商平台基础上，实现"一个后台管理系统支持多个前端网站"的架构。该方案通过站点隔离机制，让每个网站可以独立运营，同时共享同一套后端系统。

## 核心设计原则

1. **商品只属于工厂**：工厂是商品的唯一所有者
2. **出口商是聚合者**：不直接拥有商品，而是管理下属工厂
3. **独立建站能力**：每个实体（工厂/出口商）都能独立建立自己的网站
4. **展示逻辑隔离**：分类、主题、配置等按站点完全隔离
5. **结构清晰**：数据库设计避免后期大改

## 架构图

```
┌─────────────────────────────────────────────────────┐
│                   统一后端 API                        │
│                  (b2badmin)                         │
├─────────────────────────────────────────────────────┤
│          Site Context (站点上下文层)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Factory    │  │  Exporter    │  │   Admin     │ │
│  │   Site       │  │   Site       │  │   System    │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────┤
│                Business Logic                       │
│              (业务逻辑层，隔离数据)                    │
└─────────────────────────────────────────────────────┘
         ↓ API with Site Context ↓
┌─────────────────────────────────────────────────────┐
│  Site A (Factory Site)  │  Site B (Exporter Site)  │
└─────────────────────────────────────────────────────┘
```

## 数据库设计

### 核心表结构

1. **sites 表** - 站点核心信息
   - 站点名称、域名
   - 站点类型（factory/exporter）
   - 关联的业务实体ID
   - 主题配置、功能开关

2. **site_categories 表** - 站点分类体系
   - 每个站点独立的分类树
   - 可关联到全局分类（用于数据聚合）

3. **site_products 表** - 站点商品展示
   - 站点级别的商品配置
   - 自定义名称、描述、价格
   - SEO配置、展示控制

4. **user_site_permissions 表** - 用户站点权限
   - 支持用户在不同站点的不同角色
   - admin/editor/viewer 三级权限

## API 设计

### 站点上下文中间件

通过域名或请求头自动识别站点，提供统一的站点上下文：

```typescript
// 优先级：
// 1. 请求头 X-Site-ID
// 2. 查询参数 site_id
// 3. 请求头 Host（域名识别）
// 4. 环境变量 DEFAULT_SITE_ID
```

### 数据隔离机制

- **工厂站点**：只能展示自己工厂的商品
- **出口商站点**：可以展示所有下属工厂的商品
- **站点筛选**：所有API查询自动添加站点ID筛选条件

## 前端实现

### 多站点 RPC 客户端

```typescript
// 支持跨站点调用
export function createSiteRPC(options?: SiteRPCOptions) {
  const headers: Record<string, string> = {};
  if (options?.siteId) {
    headers["X-Site-ID"] = options.siteId;
  }
  return edenTreaty<App>(API_URL, { headers });
}
```

### 站点配置系统

- 动态主题配置
- 功能开关控制
- 站点级别的SEO配置

## 部署方案

### 环境变量配置

每个站点需要独立的配置：

```bash
# 网站环境变量
NEXT_PUBLIC_SITE_DOMAIN=factory-a.example.com
NEXT_PUBLIC_SITE_ID=<site-uuid-1>
NEXT_PUBLIC_SITE_TYPE=factory
```

### Nginx 配置

支持多域名指向同一应用：

```nginx
server {
    listen 80;
    server_name *.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

## 实施步骤

1. **数据库重构**
   - ✅ 创建新表结构
   - ✅ 建立索引和约束
   - ✅ 推送数据库更新

2. **API改造**
   - ✅ 实现站点上下文中间件
   - ✅ 创建站点管理API
   - ⏳ 改造现有业务API

3. **前端适配**
   - ⏳ 实现站点识别
   - ⏳ 创建主题系统
   - ⏳ 改造数据获取逻辑

4. **数据迁移**
   - ✅ 创建迁移脚本
   - ✅ 创建种子数据
   - ⏳ 执行数据迁移

## API 端点列表

### 站点管理

- `GET /site/current` - 获取当前站点信息
- `POST /site/admin/` - 创建站点（管理员）
- `GET /site/admin/` - 站点列表（管理员）
- `PATCH /site/admin/:siteId` - 更新站点（管理员）
- `DELETE /site/admin/:siteId` - 删除站点（管理员）

### 站点分类

- `POST /site/categories/` - 创建分类
- `GET /site/categories/tree` - 获取分类树
- `PATCH /site/categories/:categoryId` - 更新分类
- `DELETE /site/categories/:categoryId` - 删除分类

### 站点商品

- `POST /site/products/` - 添加商品到站点
- `GET /site/products/` - 获取站点商品列表
- `PATCH /site/products/:siteProductId` - 更新站点商品
- `DELETE /site/products/:siteProductId` - 移除商品

### 用户权限

- `POST /site/permissions/` - 授予权限
- `GET /site/permissions/` - 权限列表
- `DELETE /site/permissions/:userId` - 撤销权限

## 使用示例

### 创建工厂站点

```typescript
POST /api/site/admin/
{
  "name": "ABC工厂官方网站",
  "domain": "abc.example.com",
  "site_type": "factory",
  "entity_id": "factory-uuid",
  "theme_config": {
    "primaryColor": "#3B82F6",
    "logo": "/logo.png"
  }
}
```

### 添加商品到站点

```typescript
POST /api/site/products/
{
  "site_id": "site-uuid",
  "product_id": "product-uuid",
  "site_price": 999.99,
  "site_category_id": "category-uuid",
  "is_featured": true
}
```

## 注意事项

1. **数据安全**：确保API层面的数据隔离严格，防止跨站点数据泄露
2. **缓存策略**：不同站点的数据需要分开缓存
3. **SEO优化**：每个站点需要有独立的SEO配置
4. **性能考虑**：高频查询的字段（如site_id）需要添加索引

## 扩展功能

1. **站点级别的功能开关**：通过配置控制各站点启用哪些功能模块
2. **自定义域名**：支持站点绑定自定义域名
3. **多语言支持**：每个站点可以配置支持的语言
4. **数据统计**：分站点的访问和业务数据统计

## 后续优化建议

1. **添加 CDN 支持**：为不同站点的静态资源配置CDN
2. **实现站点模板**：预设多种站点主题模板，快速创建新站点
3. **API限流**：按站点维度进行API请求限流
4. **日志隔离**：按站点分离日志记录，便于问题排查