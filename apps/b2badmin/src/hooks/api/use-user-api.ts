import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  User,
  UserList,
  UserListQuery as UserListParams,
  CreateSalespersonData,
  Factory,
} from "@repo/contract";

// API Functions
const userApi = {
  // 获取用户列表
  getUsers: async (params: UserListParams = {}): Promise<UserList> => {
    const queryParams = new URLSearchParams({
      page: (params.page || 1).toString(),
      limit: (params.limit || 20).toString(),
      ...(params.search && { search: params.search }),
      ...(params.role && { role: params.role }),
    });

    const response = await fetch(`/api/user/list?${queryParams}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "获取用户列表失败");
    }

    return data.data;
  },

  // 获取工厂列表
  getFactories: async (): Promise<Factory[]> => {
    const response = await fetch("/api/user/factories");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "获取工厂列表失败");
    }

    return data.data;
  },

  // 创建业务员
  createSalesperson: async (salespersonData: CreateSalespersonData) => {
    const response = await fetch("/api/user/salesperson", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(salespersonData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "创建业务员失败");
    }

    return data.data;
  },

  // 更新用户状态
  updateUserStatus: async (userId: string, isActive: boolean) => {
    const response = await fetch(`/api/user/${userId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isActive }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "更新用户状态失败");
    }

    return data.data;
  },

  // 更新用户信息
  updateUser: async (userId: string, userData: Partial<User>) => {
    const response = await fetch(`/api/user/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "更新用户信息失败");
    }

    return data.data;
  },
};

// React Query Hooks

// 获取用户列表
export const useUsersQuery = (params: UserListParams = {}, options = {}) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userApi.getUsers(params),
    staleTime: 1000 * 60 * 5, // 5分钟
    ...options,
  });
};

// 获取工厂列表
export const useFactoriesQuery = (options = {}) => {
  return useQuery({
    queryKey: ["factories"],
    queryFn: () => userApi.getFactories(),
    staleTime: 1000 * 60 * 10, // 10分钟
    ...options,
  });
};

// 创建业务员
export const useCreateSalespersonMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.createSalesperson,
    onSuccess: () => {
      // 创建成功后，刷新用户列表
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: Error) => {
      console.error("创建业务员失败:", error);
    },
  });
};

// 更新用户状态
export const useUserStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      userApi.updateUserStatus(userId, isActive),
    onSuccess: () => {
      // 更新成功后，刷新用户列表
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: Error) => {
      console.error("更新用户状态失败:", error);
    },
  });
};

// 更新用户信息
export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: Partial<User> }) =>
      userApi.updateUser(userId, userData),
    onSuccess: () => {
      // 更新成功后，刷新用户列表
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: Error) => {
      console.error("更新用户信息失败:", error);
    },
  });
};

// 便捷的复合hooks

// 带搜索的用户列表
export const useUsersWithSearch = () => {
  const [searchParams, setSearchParams] = useState<UserListParams>({
    page: 1,
    limit: 20,
    search: "",
    role: "",
  });

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useUsersQuery(searchParams);

  const handleSearch = (search: string) => {
    setSearchParams((prev: UserListParams) => ({ ...prev, search, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev: UserListParams) => ({ ...prev, page }));
  };

  const handleRoleFilter = (role: string) => {
    setSearchParams((prev: UserListParams) => ({ ...prev, role, page: 1 }));
  };

  return {
    users: usersData?.users || [],
    pagination: usersData?.pagination,
    isLoading,
    error,
    searchParams,
    refetch,
    handleSearch,
    handlePageChange,
    handleRoleFilter,
  };
};

// 用户管理相关的所有操作
export const useUserManagement = () => {
  const createSalespersonMutation = useCreateSalespersonMutation();
  const userStatusMutation = useUserStatusMutation();
  const updateUserMutation = useUpdateUserMutation();

  return {
    createSalesperson: createSalespersonMutation.mutateAsync,
    isCreatingSalesperson: createSalespersonMutation.isPending,

    updateUserStatus: userStatusMutation.mutateAsync,
    isUpdatingStatus: userStatusMutation.isPending,

    updateUser: updateUserMutation.mutateAsync,
    isUpdatingUser: updateUserMutation.isPending,

    error: createSalespersonMutation.error || userStatusMutation.error || updateUserMutation.error,
  };
};