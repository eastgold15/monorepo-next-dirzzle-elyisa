import { useState } from "react";
import { useManageableUsers } from "./use-user-api";

// 组合 hook：管理用户列表和搜索功能
export function useUsersWithSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  // 查询参数
  const queryParams = {
    page,
    limit,
    ...(searchQuery && { search: searchQuery }),
  };

  // 获取用户列表
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useManageableUsers(queryParams);

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // 重置到第一页
  };

  // 处理分页
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return {
    // 数据
    users: usersData?.items || [],
    pagination: usersData?.meta || {
      total: 0,
      page,
      limit,
      totalPages: 0,
    },

    // 状态
    isLoading,
    error,

    // 操作
    refetch,
    handleSearch,
    handlePageChange,
    searchQuery,
    setSearchQuery,
  };
}
