
# 后端xxx模块标准结构规范
- xxx代表具体模块，每一个模块都要遵守这个规范
- 怎样xxx相同就表示这个文件是在描述这个xxx

  1. 模块文件夹命名规范

  - 使用 单数 + kebab-case 命名，如：
    - category (而不是 categories)
    - product (而不是 products)
    - hero-cards (而不是 hero-card)

  2. 核心文件结构

  每个业务模块必须包含以下标准文件：（但是service是可选的）

  module-name/
  ├── module_name.schema.ts      # 数据库表和关系定义（Drizzle ORM）
  ├── module_name.model.ts       # TypeScript 类型定义和业务 Schema
  ├── module_name.ts            # 控制器（REST API，处理 HTTP 请求）
  └── module_name.service.ts    # 服务层（业务逻辑，可选）

  3. .schema.ts 文件规范
  4. .model.ts 文件规范

  5. .ts 控制器文件规范

  作用：处理 HTTP 请求和响应
  特点：
  - 使用 Elysia 框架
  - 实现 RESTful API
  - 统一错误处理（不使用 try-catch）
  - 支持分页、搜索、过滤等功能

  6. .service.ts 服务层文件规范

  作用：处理复杂业务逻辑
  特点：
  - 可选文件，当逻辑复杂时创建
  - 被控制器调用
  - 处理数据库事务、业务规则等

  7. 特殊规则

  1. 不使用 index.ts：每个模块直接导出，不需要统一导出文件
  2. 不使用命名空间：使用对象组装在一起
  3. 单数命名：所有模块都使用单数命名（product 而不是 products）
  4. 动态路径处理：在 REST API 中，动态路径前要加前缀避免冲突
  5. 批量操作：删除接口接受数组参数，实现批量删除

  8. 类型共享设计

  前端可以直接使用后端 .model.ts 文件中定义的类型：
  // 前端可以直接导入后端类型
  import type { CategoryModel } from "~/types";

  这种设计确保了前后端类型的一致性，减少了类型不匹配的问题。

  9. 文档化建议

  每个模块可以创建对应的 .md 文档文件来解释：
  - 模块的用途和业务场景
  - 数据模型设计思路
  - API 使用示例
  - 特殊业务逻辑说明