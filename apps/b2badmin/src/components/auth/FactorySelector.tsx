"use client";

import { usePermissions } from "@/hooks/use-permissions";

interface FactorySelectorProps {
  value?: string;
  onChange: (factoryId: string) => void;
  className?: string;
}

// Mock factory data - 在实际应用中从API获取
const MOCK_FACTORIES = [
  { id: "1", name: "Factory A - Shanghai", exporterId: "exporter1" },
  { id: "2", name: "Factory B - Guangzhou", exporterId: "exporter1" },
  { id: "3", name: "Factory C - Shenzhen", exporterId: "exporter2" },
];

export function FactorySelector({ value, onChange, className }: FactorySelectorProps) {
  const { role, getAccessibleFactoryIds, getAccessibleExporterId } = usePermissions();

  // 获取用户可以选择的工厂
  const getSelectableFactories = () => {
    const factoryIds = getAccessibleFactoryIds();
    const exporterId = getAccessibleExporterId();

    if (role === 'salesperson') {
      // 业务员只能选择自己所属的工厂
      return MOCK_FACTORIES.filter(f => factoryIds.includes(f.id));
    } else if (role === 'factory_admin') {
      // 工厂管理员可以选择自己管理的工厂
      return MOCK_FACTORIES.filter(f => factoryIds.includes(f.id));
    } else if (role === 'exporter_admin') {
      // 出口商管理员可以选择所有下属工厂
      return MOCK_FACTORIES.filter(f => f.exporterId === exporterId);
    }

    return [];
  };

  const selectableFactories = getSelectableFactories();

  if (selectableFactories.length === 0) {
    return (
      <div className={`rounded-lg border border-slate-200 p-4 text-center ${className}`}>
        <p className="text-slate-500">No accessible factories</p>
        <p className="text-slate-400 text-sm mt-1">
          Please contact your administrator to get factory access
        </p>
      </div>
    );
  }

  // 如果只有一个工厂，自动选择
  if (selectableFactories.length === 1) {
    const factory = selectableFactories[0];
    return (
      <div className={`rounded-lg border border-slate-200 bg-slate-50 p-4 ${className}`}>
        <p className="text-sm font-medium text-slate-700">Selected Factory</p>
        <p className="text-slate-900 font-semibold">{factory.name}</p>
        <input
          type="hidden"
          value={factory.id}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  // 多个工厂时显示选择器
  return (
    <div className={className}>
      <label className="mb-1 block font-medium text-slate-700 text-sm">
        Select Factory
      </label>
      <select
        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Choose a factory...</option>
        {selectableFactories.map((factory) => (
          <option key={factory.id} value={factory.id}>
            {factory.name}
          </option>
        ))}
      </select>

      {/* 显示当前用户的角色提示 */}
      <p className="text-slate-500 text-xs mt-1">
        {role === 'salesperson' && "You can only upload products to your assigned factory"}
        {role === 'factory_admin' && "You can upload products to your managed factories"}
        {role === 'exporter_admin' && "You can upload products to all your exporter's factories"}
      </p>
    </div>
  );
}