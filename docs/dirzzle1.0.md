
---

# 关系查询 v2（Relational Queries v2）

```ts
import { drizzle } from 'drizzle-orm/…';
import { defineRelations } from 'drizzle-orm';
import * as p from 'drizzle-orm/pg-core';

export const users = p.pgTable('users', {
  id: p.integer().primaryKey(),
  name: p.text().notNull()
});
export const posts = p.pgTable('posts', {
  id: p.integer().primaryKey(),
  content: p.text().notNull(),
  ownerId: p.integer('owner_id'),
});

const relations = defineRelations({ users, posts }, (r) => ({
  posts: {
    author: r.one.users({
      from: r.posts.ownerId,
      to: r.users.id,
    }),
  }
}))

const db = drizzle(client, { relations });

const result = db.query.posts.findMany({
  with: {
    author: true,
  },
});
```

## API 变更

### 与 v1 相比有哪些不同？

关系模式定义（Relations Schema definition）是本次更新中变化最大的部分之一。

第一个主要区别在于：你不再需要为每个表分别在不同的对象中定义关系，然后再将它们全部传给 `drizzle()` 函数。在 Relational Queries v2 中，你现在有了一个**统一的地方**来定义所有你需要的表之间的关系。

回调函数中的 `r` 参数提供了全面的自动补全功能——包括你 schema 中的所有表，以及 `one`、`many` 和 `through` 等函数——基本上涵盖了定义关系所需的一切。

```ts
// relations.ts
import * as schema from "./schema"
import { defineRelations } from "drizzle-orm"
export const relations = defineRelations(schema, (r) => ({
    ...
}));

...

// index.ts
import { relations } from "./relations"
import { drizzle } from "drizzle-orm/..."
const db = drizzle(process.env.DATABASE_URL, { relations })
```

#### 1. 所有关系集中在一个地方定义

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

#### 2. 可以单独定义 `many` 而无需配对 `one`

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

#### 3. `drizzle()` 不再需要指定 `modes`

我们找到了一种适用于所有 MySQL 方言的统一策略，因此不再需要显式指定它们。

#### 4. `from` 和 `to` 的升级

我们将字段名从 `fields` / `references` 统一改为了 `from` 和 `to`，并且现在两者都支持传入单个值或数组：

```ts
author: r.one.users({
  from: r.posts.authorId,
  to: r.users.id,
}),

// 或者

author: r.one.users({
  from: [r.posts.authorId],
  to: [r.users.id],
}),
```

#### 5. `relationName` 重命名为 `alias`

```ts
import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";
export const relations = defineRelations(schema, (r) => ({
  posts: {
    author: r.one.users({
      from: r.posts.authorId,
      to: r.users.id,
      alias: "author_post",
    }),
  },
}));
```

#### 6. `where` 现在使用对象形式

```ts
const response = db.query.users.findMany({
  where: {
    id: 1,
  },
});
```

#### 7. `orderBy` 现在也使用对象形式

```ts
const response = db.query.users.findMany({
  orderBy: { id: "asc" },
});
```

---

### 新增功能

#### 1. 使用 `through` 定义多对多关系

```ts
import * as schema from './schema';
import { defineRelations } from 'drizzle-orm';
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

...

// 查询示例
const response = await db.query.users.findMany({
  with: {
    groups: true,
  },
});
```

#### 2. 预定义过滤条件（Predefined filters）

```ts
import * as schema from './schema';
import { defineRelations } from 'drizzle-orm';
export const relations = defineRelations(schema,
  (r) => ({
    groups: {
      verifiedUsers: r.many.users({
        from: r.groups.id.through(r.usersToGroups.groupId),
        to: r.users.id.through(r.usersToGroups.userId),
        where: {
          verified: true,
        },
      }),
    },
  })
);

... 

// 查询示例：获取所有包含已验证用户的群组
const response = await db.query.groups.findMany({
  with: {
    verifiedUsers: true,
  },
});
```

#### 3. 基于关联进行过滤

示例：获取所有 ID > 10 且至少有一篇内容以 “M” 开头的帖子的用户

```ts
const usersWithPosts = await db.query.usersTable.findMany({
  where: {
    id: {
      gt: 10
    }
  },
  posts: {
    content: {
      like: 'M%'
    }
  }
});
```

#### 4. 在关联对象上使用 `offset`

```ts
await db.query.posts.findMany({
  limit: 5,
  offset: 2, // ✅ 正确
  with: {
    comments: {
      offset: 3, // ✅ 正确
      limit: 3,
    },
  },
});
```

如果你有关于以下主题的问题：

- 如何将关系 schema 从 v1 迁移到 v2  
- 如何将查询从 v1 迁移到 v2  
- 是否支持部分升级，或者升级后如何继续使用 RQB v1？  
- 内部类型和导入路径的变化  

你可以参考我们的迁移指南，其中包含了所有相关信息：[点击此处查看]()

---

# 破坏性变更（Breaking Changes）

## 列编码器与解码器的变更

在 PostgreSQL 方言的所有驱动中，某些类型（如 `intervals`、`timestamps`、`dates` 和 `datetimes` 的数组）存在映射错误。这导致 Drizzle 返回的运行时值与类型声明不一致。我们已经修复了这个问题，但如果你之前在 Drizzle 之后手动处理了这些响应并忽略了类型提示，那么这次修复可能会对你造成破坏性影响。请检查项目中相关部分。

## 导入路径与内部类型的变更

1. 每个 `drizzle` 数据库实例、`session`、`migrator` 和 `transaction` 实例现在都增加了两个泛型参数，用于支持 RQB v2 查询。

```ts
// 以前

```

```ts
// 现在

```

2. `DrizzleConfig` 泛型新增了 `TRelations` 参数，并添加了 `relations: TRelations` 字段。

```ts
// 以前

```

```ts
// 现在

```

3. 以下实体已从 `drizzle-orm` 和 `drizzle-orm/relations` 移至 `drizzle-orm/_relations`。原始导入路径现在包含 RQB v2 使用的新类型。如果你仍想使用旧版类型，请务必更新你的导入路径：

```
- `Relation`
- `Relations`
- `One`
- `Many`
- `TableRelationsKeysOnly`
- `ExtractTableRelationsFromSchema`
- `ExtractObjectValues`
- `ExtractRelationsFromTableExtraConfigSchema`
- `getOperators`
- `Operators`
- `getOrderByOperators`
- `OrderByOperators`
- `FindTableByDBName`
- `DBQueryConfig`
- `TableRelationalConfig`
- `TablesRelationalConfig`
- `RelationalSchemaConfig`
- `ExtractTablesWithRelations`
- `ReturnTypeOrValue`
- `BuildRelationResult`
- `NonUndefinedKeysOnly`
- `BuildQueryResult`
- `RelationConfig`
- `extractTablesRelationalConfig`
- `relations`
- `createOne`
- `createMany`
- `NormalizedRelation`
- `normalizeRelation`
- `createTableRelationsHelpers`
- `TableRelationsHelpers`
- `BuildRelationalQueryResult`
- `mapRelationalRow`
```

4. 同样地，`${dialect}-core/query-builders/query` 文件已被移至 `${dialect}-core/query-builders/_query`，原路径现在由 RQB v2 的新实现替代。

```ts
// 以前


```

```ts
// 现在


```