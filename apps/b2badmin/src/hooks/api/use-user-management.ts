import {
  useCreateFactoryAdmin,
  useCreateSalesperson,
  useUpdateUserStatus,
} from "./use-user-api";

// 组合所有用户管理操作的 hook
export function useUserManagement() {
  const createSalesperson = useCreateSalesperson();
  const createFactoryAdmin = useCreateFactoryAdmin();
  const updateUserStatus = useUpdateUserStatus();

  return {
    // 创建相关
    createSalesperson,
    createFactoryAdmin,
    isCreatingSalesperson: createSalesperson.isPending,
    isCreatingFactoryAdmin: createFactoryAdmin.isPending,

    // 更新相关
    updateUserStatus,
    isUpdatingStatus: updateUserStatus.isPending,
  };
}