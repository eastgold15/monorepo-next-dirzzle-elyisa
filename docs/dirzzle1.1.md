以下是您提供内容的完整中文翻译：

---

# 迁移到关系查询（Relational Queries）v2

> **警告**  
> 本文档介绍的功能适用于 Drizzle ORM **1.0.0-beta.1 及更高版本**。

安装命令（任选其一）：
```bash
# npm
npm install drizzle-orm@beta
npm install -D drizzle-kit@beta

# yarn
yarn add drizzle-orm@beta
yarn add -D drizzle-kit@beta

# pnpm
pnpm add drizzle-orm@beta
pnpm add -D drizzle-kit@beta

# bun
bun add drizzle-orm@beta
bun add drizzle-kit@beta -D
```

本指南假设你已熟悉以下内容：
- [Drizzle Relations v1](https://...)
- [Relational Queries v1](https://...)
- [`drizzle-kit pull`](https://...)
- [关系基础（Relations Fundamentals）](https://...)

下方是目录，点击可跳转到对应章节：

- [与 v1 相比有哪些不同？](#what-is-working-differently-from-v1)
- [v2 中的新特性](#what-is-new)
- [如何将关系定义从 v1 迁移到 v2？](#how-to-migrate-relations-schema-definition-from-v1-to-v2)
- [如何将查询从 v1 迁移到 v2？](#how-to-migrate-queries-from-v1-to-v2)
- [部分升级：升级后如何继续使用 v1？](#partial-upgrade-or-how-to-stay-on-v1-even-after-an-upgrade)
- [内部变更（导入、类型等）](#internal-changes)

---

## 与 v1 相比有哪些不同？

### 关系 Schema 定义的重大更新

最大的变化之一在于**关系 Schema 的定义方式**。

在 v1 中，你需要为每个表分别创建独立的关系对象，然后将它们和 schema 一起传给 `drizzle()`。  
而在 Relational Queries v2 中，你只需在一个**统一的地方**定义所有表的关系。

回调函数中的 `r` 参数提供了完整的自动补全支持——包括你 schema 中的所有表，以及 `one`、`many`、`through` 等方法——几乎涵盖了定义关系所需的一切。

```ts
// relations.ts
import * as schema from "./schema"
import { defineRelations } from "drizzle-orm"
export const relations = defineRelations(schema, (r) => ({
    // 在这里定义所有关系
}));

// index.ts
import { relations } from "./relations"
import { drizzle } from "drizzle-orm/..."
const db = drizzle(process.env.DATABASE_URL, { relations })
```

### 具体差异

#### ✅ 所有关系集中定义（One place for all your relations）

❌ **v1 写法**
```ts
import { relations } from "drizzle-orm/_relations";
import { users, posts } from './schema';

export const usersRelation = relations(users, ({ one, many }) => ({
  invitee: one(users, {
    fields: [users.invitedBy],
    references: [users.id],
  }),
  posts: many(posts),
}));

export const postsRelation = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

✅ **v2 写法**
```ts
import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    invitee: r.one.users({
      from: r.users.invitedBy,
      to: r.users.id,
    }),
    posts: r.many.posts(),
  },
  posts: {
    author: r.one.users({
      from: r.posts.authorId,
      to: r.users.id,
    }),
  },
}));
```

> 💡 你仍然可以拆分关系定义（例如按模块），只要最后合并即可：
```ts
import { defineRelations, defineRelationsPart } from 'drizzle-orm';
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: { /* ... */ }
}));

export const part = defineRelationsPart(schema, (r) => ({
  posts: { /* ... */ }
}));

// 合并后传入
const db = drizzle(process.env.DB_URL, { relations: { ...relations, ...part } });
```

---

#### ✅ 可单独定义 `many`，无需配对 `one`

在 v1 中，即使你只关心“多”的一方，也必须在另一张表上定义 `one`，体验不佳。

在 v2 中，你可以**仅定义 `many`**：

❌ **v1（必须配对）**
```ts
// usersRelation 和 postsRelation 都要写
```

✅ **v2（只需写 users 的 many）**
```ts
import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  users: {
    posts: r.many.posts({
      from: r.users.id,
      to: r.posts.authorId,
    }),
  },
}));
```

---

#### ✅ 新增 `optional` 选项（类型级别控制）

在 v2 中，你可以通过 `optional: false` 告诉类型系统：该关联**一定存在**，从而让返回值中该字段变为非空。

❌ **v1 不支持**

✅ **v2 示例**
```ts
users: {
  posts: r.many.posts({
    from: r.users.id,
    to: r.posts.authorId,
    optional: false, // 表示 posts.author 永远不为 null
  }),
},
```

---

#### ✅ 移除 `drizzle()` 中的 `mode` 参数

我们为所有 MySQL 方言找到了统一策略，因此不再需要指定 `mode: "planetscale"` 或 `mode: "default"`。

❌ **v1**
```ts
const db = drizzle(url, { mode: "planetscale", schema });
```

✅ **v2**
```ts
const db = drizzle(url, { relations });
```

---

#### ✅ `fields` / `references` → `from` / `to`

字段名更直观，并且支持单值或数组：

❌ **v1**
```ts
author: one(users, {
  fields: [posts.authorId],
  references: [users.id],
}),
```

✅ **v2**
```ts
author: r.one.users({
  from: r.posts.authorId,
  to: r.users.id,
}),
// 或
author: r.one.users({
  from: [r.posts.authorId],
  to: [r.users.id],
}),
```

---

#### ✅ `relationName` → `alias`

❌ **v1**
```ts
relationName: "author_post",
```

✅ **v2**
```ts
alias: "author_post",
```

---

#### ✅ 自定义类型新增函数

v2 为 `customType` 新增了两个函数，用于控制 JSON 查询时的数据映射：

- `fromJson(value)`：从 JSON 字符串解析为运行时值
- `forJsonSelect(identifier, sql, arrayDimensions)`：自定义 JSON 序列化 SQL

✅ **v2 示例**
```ts
const customBytes = customType<{
  data: Buffer;
  driverData: Buffer;
  jsonData: string;
}>({
  dataType: () => 'bytea',
  fromJson: (value) => {
    return Buffer.from(value.slice(2), 'hex'); // 去掉 \x 前缀
  },
  forJsonSelect: (identifier, sql, arrayDimensions) =>
    sql`${identifier}::text${sql.raw('[]'.repeat(arrayDimensions ?? 0))}`,
});
```

---

## v2 中的新特性

### 1. 使用 `through` 实现多对多关系

过去你需要手动查询中间表并映射结果，现在只需一行配置！

❌ **v1（繁琐）**
```ts
// 定义三个关系 + 查询时嵌套两层
const response = await db.query.users.findMany({
  with: {
    usersToGroups: {
      columns: {},
      with: { group: true },
    },
  },
});
```

✅ **v2（简洁）**
```ts
// relations.ts
export const relations = defineRelations(schema, (r) => ({
  users: {
    groups: r.many.groups({
      from: r.users.id.through(r.usersToGroups.userId),
      to: r.groups.id.through(r.usersToGroups.groupId),
    }),
  },
  groups: {
    participants: r.many.users(),
  },
}));

// 查询
const response = await db.query.users.findMany({
  with: { groups: true },
});
```

---

### 2. 预定义过滤条件（Predefined filters）

可在关系定义中直接加入 `where` 条件，查询时自动应用。

✅ **v2 示例**
```ts
groups: {
  verifiedUsers: r.many.users({
    from: r.groups.id.through(r.usersToGroups.groupId),
    to: r.users.id.through(r.usersToGroups.userId),
    where: { verified: true }, // 只返回 verified = true 的用户
  }),
}

// 查询
await db.query.groups.findMany({ with: { verifiedUsers: true } });
```

> ❌ v1 不支持此功能。

---

### 3. `where` 改为对象形式

❌ **v1（函数式）**
```ts
where: (users, { eq }) => eq(users.id, 1)
```

✅ **v2（对象式）**
```ts
where: { id: 1 }
```

支持复杂操作（AND/OR/NOT/RAW），详见 [Select Filters 文档](https://...)。

---

### 4. `orderBy` 改为对象形式

❌ **v1**
```ts
orderBy: (users, { asc }) => [asc(users.id)]
```

✅ **v2**
```ts
orderBy: { id: "asc" }
```

---

### 5. 支持基于关联的过滤

✅ **v2 示例**：获取 ID > 10 且至少有一篇内容以 “M” 开头的帖子的用户
```ts
const usersWithPosts = await db.query.users.findMany({
  where: {
    id: { gt: 10 },
    posts: { content: { like: 'M%' } }
  }
});
```

> ❌ v1 不支持。

---

### 6. 关联对象支持 `offset`

✅ **v2**
```ts
await db.query.posts.findMany({
  limit: 5,
  offset: 2,
  with: {
    comments: {
      offset: 3,
      limit: 3,
    },
  },
});
```

> ❌ v1 不支持。

---

## 如何将关系定义从 v1 迁移到 v2？

### 方法一：使用 `drizzle-kit pull`（推荐）

新版 `drizzle-kit pull` 可自动生成 v2 格式的关系文件。

**步骤 1**：拉取数据库结构
```bash
bunx drizzle-kit pull
```

**步骤 2**：迁移生成的 `relations.ts`

项目结构示例：
```
├ 📂 drizzle
│ ├ 📜 relations.ts   ← 自动生成
│ └ 📜 schema.ts
├ 📂 src
│ ├ 📂 db
│ │ ├ 📜 relations.ts ← 你的实际使用文件（复制内容到这里）
│ │ └ 📜 schema.ts
│ └ 📜 index.ts
```

> 注意：生成的 `relations.ts` 会 `import * as schema from './schema'`。  
> 如果你的 schema 分散在多个文件，请手动合并：
> ```ts
> import * as schema1 from './schema1'
> import * as schema2 from './schema2'
> const schema = { ...schema1, ...schema2 }
> ```

**步骤 3**：更新 `drizzle()` 初始化

❌ **之前**
```ts
import * as schema from './schema'
const db = drizzle(url, { schema })
```

✅ **之后**
```ts
import { relations } from './db/relations' // 从你自己的文件导入
const db = drizzle(url, { relations })
```

> 如果你用的是 MySQL，记得移除 `mode` 参数。

---

### 方法二：手动迁移

参考官方文档中的关系示例（一对一、一对多、多对多）逐条转换。

---

## 如何将查询从 v1 迁移到 v2？

### 1. `where` 迁移

使用新的对象语法，支持：
- 简单等值：`{ id: 1 }`
- 操作符：`{ age: { gt: 18 } }`
- 逻辑组合：`and`, `or`, `not`
- 原生 SQL：`sql.raw(...)`

示例：
```ts
db.query.users.findMany({
  where: {
    age: 15,
    name: { like: 'A%' }
  }
})
```

生成 SQL：
```sql
SELECT "users"."id", "users"."name"
FROM "users"
WHERE ("users"."age" = $1) AND ("users"."name" LIKE $2)
```

---

### 2. `orderBy` 迁移

❌ v1：
```ts
orderBy: (users, { asc }) => [asc(users.id)]
```

✅ v2：
```ts
orderBy: { id: "asc" }
// 或多字段：
orderBy: [{ id: "desc" }, { name: "asc" }]
```

---

### 3. 多对多查询迁移

如前所述，v2 极大简化了多对多查询，只需定义 `through` 并直接 `with: { groups: true }`。

---

## 部分升级：如何在升级后继续使用 v1？

Drizzle 团队设计了**平滑过渡方案**，允许你逐步迁移。

### 步骤 1：保留 v1 的关系定义

将 `relations` 导入路径改为 `_relations`：

```ts
// v1 风格（仍可用）
import { relations } from "drizzle-orm/_relations";
```

### 步骤 2：旧查询改用 `db._query`

- `db.query` → **v2 新语法**
- `db._query` → **v1 旧语法（保留）**

```ts
// 继续使用 v1 查询
await db._query.users.findMany();

// 使用 v2 查询
await db.query.users.findMany();
```

> 为什么不用 `db.queryV2`？  
> 因为我们希望未来所有新 API 都保持简洁（`db.query`），而不是变成 `db.queryV3`、`db.queryV4`……

### 步骤 3：逐步迁移

- 新功能用 v2
- 旧代码暂时保留 v1
- 最终统一迁移到 v2

---

## 内部变更

### 1. 泛型参数增加

所有 `drizzle` 实例（数据库、session、migrator、transaction）现在多了 **2 个泛型参数**，用于支持 RQB v2。

### 2. `DrizzleConfig` 新增 `TRelations`

```ts
// 现在
type DrizzleConfig<Schema, Relations>
```

### 3. 大量类型移动到 `_relations`

以下类型已从 `drizzle-orm` 移至 `drizzle-orm/_relations`：

```
Relation, Relations, One, Many, TableRelationsKeysOnly,
ExtractTableRelationsFromSchema, ExtractObjectValues,
ExtractRelationsFromTableExtraConfigSchema, getOperators,
Operators, getOrderByOperators, OrderByOperators,
FindTableByDBName, DBQueryConfig, TableRelationalConfig,
TablesRelationalConfig, RelationalSchemaConfig,
ExtractTablesWithRelations, ReturnTypeOrValue,
BuildRelationResult, NonUndefinedKeysOnly,
BuildQueryResult, RelationConfig,
extractTablesRelationalConfig, relations,
createOne, createMany, NormalizedRelation,
normalizeRelation, createTableRelationsHelpers,
TableRelationsHelpers, BuildRelationalQueryResult,
mapRelationalRow
```

> 如果你仍在使用这些旧类型，请更新导入路径。

### 4. 查询构建器路径变更

`${dialect}-core/query-builders/query`  
→  
`${dialect}-core/query-builders/_query`

原路径现在由 v2 的新实现占据。

--- 

如需进一步帮助，请查阅官方 [迁移指南](https://...)。