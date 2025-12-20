# 🤖 全栈 API 契约速查表 (AI 专用)

> 此文档由脚本深度解析 TypeBox 组合逻辑生成。AI 请参考此结构构建请求。

## 模块: ACCOUNT

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: accountTable` | `Database` | Update | 直接映射自数据库表 accountTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: ADS

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: adsTable` | `Database` | Update | 直接映射自数据库表 adsTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: ATTRIBUTE

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: attributeTable` | `Database` | Update | 直接映射自数据库表 attributeTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: ATTRIBUTETEMPLATE

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: attributeTemplateTable` | `Database` | Update | 直接映射自数据库表 attributeTemplateTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: ATTRIBUTEVALUE

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: attributeValueTable` | `Database` | Update | 直接映射自数据库表 attributeValueTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: CUSTOMER

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: CustomerTable` | `Database` | Update | 直接映射自数据库表 CustomerTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: DAILYINQUIRYCOUNTER

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: dailyInquiryCounterTable` | `Database` | Update | 直接映射自数据库表 dailyInquiryCounterTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: EXPORTERS

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: exportersTable` | `Database` | Update | 直接映射自数据库表 exportersTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: FACTORIES

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: factoriesTable` | `Database` | Update | 直接映射自数据库表 factoriesTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: HEROCARDS

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: heroCardsTable` | `Database` | Update | 直接映射自数据库表 heroCardsTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: INQUIRY

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: inquiryTable` | `Database` | Update | 直接映射自数据库表 inquiryTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: INQUIRYITEMS

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: inquiryItemsTable` | `Database` | Update | 直接映射自数据库表 inquiryItemsTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: MASTER

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: masterTable` | `Database` | Update | 直接映射自数据库表 masterTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: MEDIA

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: mediaTable` | `Database` | Update | 直接映射自数据库表 mediaTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: MEDIAMETADATA

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: mediaMetadataTable` | `Database` | Update | 直接映射自数据库表 mediaMetadataTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: PERMISSION

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: permissionTable` | `Database` | Update | 直接映射自数据库表 permissionTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: PRODUCTMASTERCATEGORIES

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: productMasterCategoriesTable` | `Database` | Update | 直接映射自数据库表 productMasterCategoriesTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: PRODUCTMEDIA

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: productMediaTable` | `Database` | Update | 直接映射自数据库表 productMediaTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: PRODUCTS

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: productsTable` | `Database` | Update | 直接映射自数据库表 productsTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |
| `categoryId` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: PRODUCTTEMPLATE

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: productTemplateTable` | `Database` | Update | 直接映射自数据库表 productTemplateTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: QUOTATIONITEMS

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: quotationItemsTable` | `Database` | Update | 直接映射自数据库表 quotationItemsTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: QUOTATIONS

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: quotationsTable` | `Database` | Update | 直接映射自数据库表 quotationsTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: ROLE

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: roleTable` | `Database` | Update | 直接映射自数据库表 roleTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: ROLEPERMISSIONS

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: rolePermissionsTable` | `Database` | Update | 直接映射自数据库表 rolePermissionsTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: SALESPERSONAFFILIATIONS

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: salespersonAffiliationsTable` | `Database` | Update | 直接映射自数据库表 salespersonAffiliationsTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: SALESPERSONCATEGORIES

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: salespersonCategoriesTable` | `Database` | Update | 直接映射自数据库表 salespersonCategoriesTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: SALESPERSONS

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: salespersonsTable` | `Database` | Update | 直接映射自数据库表 salespersonsTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: SESSION

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: sessionTable` | `Database` | Update | 直接映射自数据库表 sessionTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: SITECATEGORIES

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: siteCategoriesTable` | `Database` | Update | 直接映射自数据库表 siteCategoriesTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: SITECONFIG

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: siteConfigTable` | `Database` | Update | 直接映射自数据库表 siteConfigTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: SITEPRODUCTS

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: siteProductsTable` | `Database` | Update | 直接映射自数据库表 siteProductsTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: SITES

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: sitesTable` | `Database` | Update | 直接映射自数据库表 sitesTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: SKUMEDIA

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: skuMediaTable` | `Database` | Update | 直接映射自数据库表 skuMediaTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: SKUS

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: skusTable` | `Database` | Update | 直接映射自数据库表 skusTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: TRANSLATIONDICT

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: translationDictTable` | `Database` | Update | 直接映射自数据库表 translationDictTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: USERS

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: usersTable` | `Database` | Update | 直接映射自数据库表 usersTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: USERSITEROLES

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: userSiteRolesTable` | `Database` | Update | 直接映射自数据库表 userSiteRolesTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
## 模块: VERIFICATION

### 🏷️ Response
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Ref: _Select` | `Schema` | 原样 | 引用内部预定义的 Schema |

### 🏷️ Create
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: _Insert` | `Schema` | Omit | 对基础 Schema 进行 Omit 处理 |

### 🏷️ Update
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Table: verificationTable` | `Database` | Update | 直接映射自数据库表 verificationTable |

### 🏷️ Patch
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Base: t.Omit(_Insert` | `Schema` | Partial | 对基础 Schema 进行 Partial 处理 |

### 🏷️ ListQuery
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `Inherit: t.Partial(t.Omit(_Insert, ["id", "createdAt", "updatedAt"]))` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: PaginationParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `Inherit: SortParams` | `Object` | 混合 | 继承该公共模块的所有字段 |
| `search` | `Optional` | 可选 | t.Optional(t.String()) |

### 🏷️ ListResponse
| 来源/字段 | 类型 | 状态 | 详细说明 |
| :--- | :--- | :--- | :--- |
| `data` | `Array` | 必填 | t.Array(_Select) |
| `total` | `Number` | 必填 | t.Number() |


---
