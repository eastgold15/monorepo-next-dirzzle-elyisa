import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 用户站点角色相关 hooks
export function useUserSiteRolesList() {
  return useQuery({
    queryKey: ["usersiteroles", "list"],
    queryFn: async () => await handleEden(rpc.api.v1.usersiteroles.admin.get()),
  });
}

export function useUserSiteRoleCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) =>
      await handleEden(rpc.api.v1.usersiteroles.post(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersiteroles"] });
    },
  });
}

export function useUserSiteRoleUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) =>
      await handleEden(rpc.api.v1.usersiteroles({ id }).put(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersiteroles"] });
    },
  });
}

export function useUserSiteRoleDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      await handleEden(rpc.api.v1.usersiteroles({ id }).delete()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersiteroles"] });
    },
  });
}

// 获取站点下的用户列表
export function useSiteUsers(siteId: string) {
  return useQuery({
    queryKey: ["usersiteroles", "site", siteId],
    queryFn: async () =>
      await handleEden(rpc.api.v1.usersiteroles.site({ siteId }).users.get()),
    enabled: !!siteId,
  });
}

// 获取用户的站点列表
export function useUserSites(userId: string) {
  return useQuery({
    queryKey: ["usersiteroles", "user", userId],
    queryFn: async () =>
      await handleEden(rpc.api.v1.usersiteroles.user({ userId }).sites.get()),
    enabled: !!userId,
  });
}

// 批量分配用户到站点
export function useBatchAssignUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      userIds: string[];
      siteId: string;
      roleId: string;
    }) => await handleEden(rpc.api.v1.usersiteroles.batch.assign.post(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersiteroles"] });
    },
  });
}
