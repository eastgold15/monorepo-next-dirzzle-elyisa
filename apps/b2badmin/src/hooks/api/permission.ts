import type {
  PermissionContract,
  RolePermissionsContract,
} from "@repo/contract";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";
// 权限相关 hooks
export function usePermissionsList(
  query?: typeof PermissionContract.ListQuery.static
) {
  return useQuery({
    queryKey: ["permissions", "list", query],
    queryFn: async () =>
      await handleEden(
        rpc.api.v1.permission.get({
          query,
        })
      ),
  });
}

export function usePermissionCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: typeof PermissionContract.Create.static) =>
      await handleEden(rpc.api.v1.permission.post(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
}

export function usePermissionDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await handleEden(rpc.api.v1.permission({ id }).delete()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
}

// 角色权限关联 hooks
export function useRolePermissionsList(
  query: typeof RolePermissionsContract.ListQuery.static
) {
  return useQuery({
    queryKey: ["rolepermissions", "list", query],
    queryFn: async () =>
      await handleEden(rpc.api.v1.rolepermissions.get({ query })),
    enabled: !!query.roleId,
  });
}

export function useRolePermissionCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: typeof RolePermissionsContract.Create.static) =>
      await handleEden(rpc.api.v1.rolepermissions.post(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rolepermissions"] });
    },
  });
}

export function useRolePermissionDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await handleEden(rpc.api.v1.rolepermissions({ id }).delete()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rolepermissions"] });
    },
  });
}

// 批量更新角色权限
export function useBatchUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: typeof RolePermissionsContract.BatchUpdate.static
    ) => await handleEden(rpc.api.v1.rolepermissions.batch.update.post(data)),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["rolepermissions", variables.roleId],
      });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
}
