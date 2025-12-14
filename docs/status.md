hooks 整合完成：
所有用户相关的 hooks 都整合到 use-user.ts 文件中
提供了多个专门的 hooks：useUser, usePermissions, useTeam, useOrganization, useQuickAccess
组件更新完成：
UserDashboard - 使用新的 hooks 显示用户信息和统计数据
TeamSwitcher - 显示组织架构信息（出口商和工厂）
AppSidebar - 只使用 usePermissions 来控制导航菜单
数据流清晰：
后端 /me 接口返回结构化的用户数据
前端通过 hooks 获取并使用这些数据
组件根据用户角色显示相应的内容


apps/b2badmin/src/hooks/
├── api/                    # API 相关 hooks
│   ├── ads.ts             # 广告相关
│   ├── auth.ts            # 认证相关
│   ├── category.ts        # 分类相关（整合了3个旧文件）
│   ├── factory.ts         # 工厂相关
│   ├── hero-cards.ts      # 首页卡片相关
│   ├── index.ts           # 导出文件
│   ├── inquiry.ts         # 询盘相关
│   ├── media.ts           # 媒体文件相关（包含上传功能）
│   ├── product.ts         # 产品相关
│   ├── site-config.ts     # 网站配置相关
│   ├── template-api.ts    # 模板相关
│   ├── translations.ts    # 翻译相关
│   ├── user.ts            # 用户相关（整合了use-user.ts）
│   ├── use-user-api.ts    # 用户管理API
│   ├── utils.ts           # 工具函数
│   └── websocket.ts       # WebSocket相关
└── ui/                     # UI 相关 hooks
    ├── index.ts           # 导出文件
    ├── use-mobile.ts      # 移动端相关
    └── useCategoryNavigation.ts  # 分类导航