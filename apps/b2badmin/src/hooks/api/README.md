# API Hooks 架构说明

本文档说明了项目中 API hooks 的架构设计原则和最佳实践。

## 架构原则
1. 纯净的数据 Hook ，这个 Hook 只管拿数据，不管别的。
2. API -> TanStack Query -> useEffect (Sync) -> Zustand Store

- [React Query 官方文档](https://tanstack.com/query/latest)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [契约层设计文档](../packages/contract/README.md)