// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { rpc } from "@/lib/rpc";
// import { handleEden } from "@/lib/utils/base";

// // 翻译相关 hooks
// export function useTranslationsList() {
//   return useQuery({
//     queryKey: ["translations", "list"],
//     queryFn: async () => await handleEden(rpc.api.v1.translationdict.get()),
//     staleTime: 10 * 60 * 1000, // 10分钟
//   });
// }

// export function useTranslationDetail(key: string) {
//   return useQuery({
//     queryKey: ["translation", key],
//     queryFn: async () =>
//       await handleEden(rpc.api.v1.translationdict({ key }).get()),
//     enabled: !!key,
//   });
// }

// export function useTranslationUpdate() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ key, data }: { key: string; data: any }) =>
//       await handleEden(rpc.api.v1.translationdict({ key }).put({ data })),
//     onSuccess: (_, { key }) => {
//       queryClient.invalidateQueries({ queryKey: ["translations"] });
//       queryClient.invalidateQueries({ queryKey: ["translation", key] });
//     },
//   });
// }
