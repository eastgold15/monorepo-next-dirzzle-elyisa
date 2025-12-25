import type { RoleContract } from "@repo/contract";
import { useQuery } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

// 角色相关 hooks
export function useRolesList(query: typeof RoleContract.ListQuery.static) {
  return useQuery({
    queryKey: ["roles", "list", query],
    queryFn: async () => await handleEden(rpc.api.v1.role.get({ query })),
  });
}

// export function useRoleCreate() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (data: any) =>
//       await handleEden(rpc.api.v1.role.post(data)),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["roles"] });
//     },
//   });
// }

// export function useRoleUpdate() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ id, data }: { id: string; data: any }) =>
//       await handleEden(rpc.api.v1.role({ id }).patch(data)),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["roles"] });
//     },
//   });
// }

// export function useRoleDelete() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (id: string) =>
//       await handleEden(rpc.api.v1.role({ id }).delete()),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["roles"] });
//     },
//   });
// }

// export function useRoleBatchDelete() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (ids: string[]) =>
//       await Promise.all(ids.map((id) => handleEden(rpc.api.v1.role({ id }).delete()))),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["roles"] });
//     },
//   });
// }
