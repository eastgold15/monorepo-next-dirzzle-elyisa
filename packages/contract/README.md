# @repo/contract

契约层 - 统一的 Zod Schema 和类型管理系统

## 概述

`@repo/contract` 是 Gina 项目中的契约层，提供统一的 Zod Schema 验证、类型定义和数据转换功能。它确保前后端之间的类型安全性和数据一致性。

## 主要功能

- 🔒 **类型安全**: 基于 TypeScript 和 Zod 的完整类型系统
- 🔄 **数据转换**: 前后端数据格式的自动转换
- 🛠️ **代码生成**: 自动生成模块 Schema 和类型定义
- ✅ **验证**: 运行时数据验证和类型守卫
- 📦 **模块化**: 每个业务模块独立的契约定义

## 包结构

```
@repo/contract/
├── modules/        # 业务模块契约
├── utils/         # 工具函数
└── types/         # 类型定义
```


mycli   gen 