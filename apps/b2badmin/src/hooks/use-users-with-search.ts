import { useState } from "react";
import { useManageableUsers } from "./api/user";

// 组合 hook：管理用户列表和搜索功能
export function useUsersWithSearch() {
  const [searchQuery, setSearchQuery] = useState("");

  // 查询参数
  const queryParams = {
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
  };

  return {
    // 数据
    users: usersData || [],
    // 状态
    isLoading,
    error,

    // 操作
    refetch,
    handleSearch,
    searchQuery,
    setSearchQuery,
  };
}
