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