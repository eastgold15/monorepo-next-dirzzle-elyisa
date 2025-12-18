import { useMutation } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

export function useInquiryMutation() {
  return useMutation({
    mutationFn: async (args: Parameters<typeof rpc.api.inquiry.post>[0]) =>
      await handleEden(rpc.api.inquiry.post(args)),
  });
}
