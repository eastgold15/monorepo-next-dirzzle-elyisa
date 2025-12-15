"use client";

import type { CreateFactoryWithAdminRequest } from "@repo/contract";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CategoryMultiSelector } from "@/components/CategoryMultiSelector";
import { rpc } from "@/lib/rpc";
import { handleEden } from "@/lib/utils/base";

interface CreateFactoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateFactoryModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateFactoryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateFactoryWithAdminRequest>({
    defaultValues: {
      factory: {
        categoryIds: [],
      },
    },
  });

  // 创建工厂的mutation
  const createFactoryMutation = useMutation({
    mutationFn: async (data: CreateFactoryWithAdminRequest) => {
      const response = await rpc.api.factory["create-with-admin"].post(data);
      const { data: responseData } = handleEden(response);

      if (!responseData) {
        throw new Error("创建工厂失败");
      }

      return responseData;
    },
    onSuccess: () => {
      toast.success("工厂创建成功");
      reset();
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || "创建工厂失败，请稍后重试");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: CreateFactoryWithAdminRequest) => {
    // 验证分类
    if (!data.factory.categoryIds || data.factory.categoryIds.length === 0) {
      toast.error("请至少选择一个产品分类");
      return;
    }

    setIsSubmitting(true);
    createFactoryMutation.mutate(data);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bold text-2xl text-slate-900">创建新工厂</h2>
          <button
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            disabled={isSubmitting}
            onClick={handleClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* 工厂信息 */}
          <div>
            <h3 className="mb-4 font-semibold text-lg text-slate-900">
              工厂信息
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block font-medium text-slate-700 text-sm">
                  工厂名称 *
                </label>
                <input
                  type="text"
                  {...register("factory.name", { required: "请输入工厂名称" })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="例如：华为制造工厂"
                />

                {errors.factory?.name && (
                  <p className="mt-1 text-red-600 text-sm">
                    {errors.factory.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-700 text-sm">
                  工厂编码 *
                </label>
                <input
                  type="text"
                  {...register("factory.code", { required: "请输入工厂编码" })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="例如：HW001"
                />

                {errors.factory?.code && (
                  <p className="mt-1 text-red-600 text-sm">
                    {errors.factory.code.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block font-medium text-slate-700 text-sm">
                  工厂描述
                </label>
                <textarea
                  {...register("factory.description")}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="请输入工厂的详细描述..."
                  rows={3}
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-700 text-sm">
                  官网地址 *
                </label>
                <input
                  type="url"
                  {...register("factory.website", {
                    required: "请输入官网地址",
                  })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://example.com"
                />

                {errors.factory?.website && (
                  <p className="mt-1 text-red-600 text-sm">
                    {errors.factory.website.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block font-medium text-slate-700 text-sm">
                  产品分类 *{" "}
                  <span className="font-normal text-slate-400">
                    （最多选择5个）
                  </span>
                </label>
                <CategoryMultiSelector
                  error={errors.factory?.categoryIds?.message}
                  onChange={(value) => setValue("factory.categoryIds", value)}
                  placeholder="请选择产品分类"
                  value={watch("factory.categoryIds")}
                />

                {errors.factory?.categoryIds && (
                  <p className="mt-1 text-red-600 text-sm">
                    {errors.factory.categoryIds.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block font-medium text-slate-700 text-sm">
                  详细地址 *
                </label>
                <input
                  type="text"
                  {...register("factory.address", {
                    required: "请输入详细地址",
                  })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="例如：广东省深圳市南山区科技园"
                />

                {errors.factory?.address && (
                  <p className="mt-1 text-red-600 text-sm">
                    {errors.factory.address.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-700 text-sm">
                  联系电话 *
                </label>
                <input
                  type="tel"
                  {...register("factory.contactPhone", {
                    required: "请输入联系电话",
                  })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="例如：0755-88888888"
                />

                {errors.factory?.contactPhone && (
                  <p className="mt-1 text-red-600 text-sm">
                    {errors.factory.contactPhone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-700 text-sm">
                  员工数量
                </label>
                <input
                  type="number"
                  {...register("factory.employeeCount", {
                    valueAsNumber: true,
                  })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min={0}
                  placeholder="例如：500"
                />
              </div>
            </div>
          </div>

          {/* 工厂管理员信息 */}
          <div>
            <h3 className="mb-4 font-semibold text-lg text-slate-900">
              工厂管理员信息
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block font-medium text-slate-700 text-sm">
                  管理员姓名 *
                </label>
                <input
                  type="text"
                  {...register("admin.name", { required: "请输入管理员姓名" })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="管理员姓名"
                />

                {errors.admin?.name && (
                  <p className="mt-1 text-red-600 text-sm">
                    {errors.admin.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-700 text-sm">
                  管理员邮箱 *
                </label>
                <input
                  type="email"
                  {...register("admin.email", {
                    required: "请输入管理员邮箱",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "请输入有效的邮箱地址",
                    },
                  })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="admin@example.com"
                />

                {errors.admin?.email && (
                  <p className="mt-1 text-red-600 text-sm">
                    {errors.admin.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-700 text-sm">
                  管理员密码 *
                </label>
                <input
                  type="password"
                  {...register("admin.password", {
                    required: "请输入密码",
                    minLength: {
                      value: 6,
                      message: "密码至少需要6个字符",
                    },
                  })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="至少6个字符"
                />

                {errors.admin?.password && (
                  <p className="mt-1 text-red-600 text-sm">
                    {errors.admin.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-700 text-sm">
                  管理员电话 *
                </label>
                <input
                  type="tel"
                  {...register("admin.phone", { required: "请输入管理员电话" })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="例如：13800138000"
                />

                {errors.admin?.phone && (
                  <p className="mt-1 text-red-600 text-sm">
                    {errors.admin.phone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-slate-200 border-t pt-4">
            <button
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              disabled={isSubmitting}
              onClick={handleClose}
              type="button"
            >
              取消
            </button>
            <button
              className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "创建中..." : "创建工厂"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
