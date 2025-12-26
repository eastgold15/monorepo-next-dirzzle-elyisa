import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

export interface SiteCategoryTreeRes {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  parentId?: any;
  sortOrder: number;
  siteId: string;
  masterCategoryId?: any;
  children?: Child[];
}
interface Child {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  parentId: string;
  sortOrder: number;
  siteId: string;
  masterCategoryId?: any;
}

export function useSiteCategoryQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: async () => {
      const result = handleEden(
        await rpc.api.v1.sitecategories.get()
      ) as unknown as SiteCategoryTreeRes[];
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5分钟
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
}

export interface SiteCategoryDetailRes {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  parentId?: any;
  sortOrder: number;
  siteId: string;
  description?: string;
  masterCategoryId?: string;
}

export function useCategoryDetailQuery(
  id: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.categories.desc(id),
    queryFn: async () => {
      const result = handleEden(
        await rpc.api.v1.sitecategories[id].get()
      ) as unknown as SiteCategoryDetailRes;
      return result;
    },
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5分钟
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
