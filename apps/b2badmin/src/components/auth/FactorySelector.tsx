"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFactoriesQuery } from "@/hooks/api/use-factories";

interface FactorySelectorProps {
  value?: string;
  onChange: (factoryId: string) => void;
  className?: string;
}

export function FactorySelector({
  value,
  onChange,
  className,
}: FactorySelectorProps) {
  // 获取工厂列表
  const { data: factories, isLoading } = useFactoriesQuery();

  if (isLoading) {
    return (
      <div className={`rounded-lg border border-slate-200 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!factories || factories.length === 0) {
    return (
      <div
        className={`rounded-lg border border-slate-200 p-4 text-center ${className}`}
      >
        <p className="text-slate-500">No accessible factories</p>
        <p className="mt-1 text-slate-400 text-sm">
          Please contact your administrator to get factory access
        </p>
      </div>
    );
  }

  // 过滤可选择的工厂
  const getSelectableFactories = () => {
    if (isFactoryAdmin && tenantId) {
      // 工厂管理员只能选择自己管理的工厂
      return factories.filter((f) => f.id === tenantId);
    }

    if (isExporterAdmin) {
      // 出口商管理员可以选择所有工厂
      return factories;
    }

    return [];
  };

  const selectableFactories = getSelectableFactories();

  if (selectableFactories.length === 0) {
    return (
      <div
        className={`rounded-lg border border-slate-200 p-4 text-center ${className}`}
      >
        <p className="text-slate-500">No accessible factories</p>
        <p className="mt-1 text-slate-400 text-sm">
          {isFactoryAdmin
            ? "You are not assigned to any factory"
            : "Please contact your administrator to get factory access"}
        </p>
      </div>
    );
  }

  // 如果只有一个工厂，自动选择
  if (selectableFactories.length === 1) {
    const factory = selectableFactories[0];

    // 如果还没有值，自动设置
    if (!value) {
      onChange(factory.id);
    }

    return (
      <div
        className={`rounded-lg border border-slate-200 bg-slate-50 p-4 ${className}`}
      >
        <p className="font-medium text-slate-700 text-sm">Selected Factory</p>
        <p className="font-semibold text-slate-900">{factory.name}</p>
        <p className="text-slate-600 text-sm">{factory.code}</p>
      </div>
    );
  }

  // 多个工厂时显示选择器
  return (
    <div className={className}>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger>
          <SelectValue placeholder="Select a factory..." />
        </SelectTrigger>
        <SelectContent>
          {selectableFactories.map((factory) => (
            <SelectItem key={factory.id} value={factory.id}>
              <div className="flex w-full items-center justify-between">
                <span>{factory.name}</span>
                <span className="text-slate-500 text-sm">{factory.code}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 显示当前用户的角色提示 */}
      <p className="mt-1 text-slate-500 text-xs">
        {isFactoryAdmin && "You can manage this factory only"}
        {isExporterAdmin && "You can manage all your factories"}
      </p>
    </div>
  );
}
