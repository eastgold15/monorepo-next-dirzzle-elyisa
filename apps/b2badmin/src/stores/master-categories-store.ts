import type { MasterDTO } from "@repo/contract";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface MasterCategoryState {
  // 树形数据
  treeData: MasterDTO["TreeEntity"][];
  // 扁平化数据（用于快速查找）
  flatData: Map<string, MasterDTO["TreeEntity"]>;
  // 加载状态
  isLoading: boolean;
  // 最后更新时间
  lastUpdated: Date | null;

  // Actions
  setTreeData: (data: MasterDTO["TreeEntity"][]) => void;
  setLoading: (loading: boolean) => void;
  // 获取分类的完整路径
  getCategoryPath: (categoryId: string) => string[];
  // 根据ID查找分类
  getCategoryById: (categoryId: string) => MasterDTO["TreeEntity"] | undefined;
  // 获取所有子分类ID
  getAllChildIds: (categoryId: string) => string[];
  // 清空数据
  clear: () => void;
}

// 将树形数据转换为扁平化 Map
const treeToFlatMap = (
  tree: MasterDTO["TreeEntity"][]
): Map<string, MasterDTO["TreeEntity"]> => {
  const map = new Map<string, MasterDTO["TreeEntity"]>();

  const traverse = (nodes: MasterDTO["TreeEntity"][]) => {
    for (const node of nodes) {
      map.set(node.id, node);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  };

  traverse(tree);
  return map;
};

export const useMasterCategoryStore = create<MasterCategoryState>()(
  devtools(
    (set, get) => ({
      // Initial state
      treeData: [],
      flatData: new Map(),
      isLoading: false,
      lastUpdated: null,

      // Actions
      setTreeData: (data: MasterDTO["TreeEntity"][]) => {
        set({
          treeData: data,
          flatData: treeToFlatMap(data),
          lastUpdated: new Date(),
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      getCategoryPath: (categoryId: string) => {
        const { flatData } = get();
        const path: string[] = [];
        let current = flatData.get(categoryId);

        while (current) {
          path.unshift(current.name);
          if (current.parentId) {
            current = flatData.get(current.parentId);
          } else {
            break;
          }
        }

        return path;
      },

      getCategoryById: (categoryId: string) => get().flatData.get(categoryId),

      getAllChildIds: (categoryId: string): string[] => {
        const { flatData } = get();
        const ids: string[] = [];

        const traverse = (id: string) => {
          const children = Array.from(flatData.values()).filter(
            (item) => item.parentId === id
          );
          for (const child of children) {
            ids.push(child.id);
            traverse(child.id);
          }
        };

        traverse(categoryId);
        return ids;
      },

      clear: () => {
        set({
          treeData: [],
          flatData: new Map(),
          lastUpdated: null,
        });
      },
    }),
    {
      name: "master-categories-store",
    }
  )
);
