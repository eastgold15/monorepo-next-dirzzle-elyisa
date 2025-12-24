import { useMutation } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

export function useInquiryMutation() {
  return useMutation({
    mutationFn: async (args: Parameters<typeof rpc.api.v1.inquiry.post>[0]) =>
      handleEden(await rpc.api.v1.inquiry.post(args)),
  });
}
