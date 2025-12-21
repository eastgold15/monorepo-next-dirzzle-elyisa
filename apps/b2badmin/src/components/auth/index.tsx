// 只导出这两个权限控制组件

// 导出权限类型和常量
export type { PermissionType } from "@/types/permission";
export { PERMISSIONS } from "@/types/permission";
export { Can } from "./Can";
export { Has, HasRole } from "./Has";
