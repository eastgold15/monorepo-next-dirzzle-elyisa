"use client";

import { Check, Loader2, Search, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useBatchUpdateRolePermissions,
  usePermissionsList,
  useRolePermissionsList,
} from "@/hooks/api/permission";
import {
  PERMISSION_RESOURCES,
  type PermissionAction,
} from "@/types/permission";

interface EditRolePermissionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId: string;
  roleName: string;
  onSuccess?: () => void;
}

export function EditRolePermissionsModal({
  open,
  onOpenChange,
  roleId,
  roleName,
  onSuccess,
}: EditRolePermissionsModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAllResource, setSelectAllResource] = useState<
    Record<string, boolean>
  >({});

  const { data: permissions, isLoading: permissionsLoading } =
    usePermissionsList();
  const { data: rolePermissions, isLoading: rolePermissionsLoading } =
    useRolePermissionsList({ roleId });

  const batchUpdate = useBatchUpdateRolePermissions();

  // 当角色权限加载完成后，初始化已选中的权限
  useEffect(() => {
    if (rolePermissions && open) {
      // 从 permission 对象中获取权限名称（如 USERS_VIEW）
      const selectedIds = new Set(
        rolePermissions
          .map((rp) => rp.permission?.name)
          .filter((name): name is string => !!name)
      );
      setSelectedPermissions(selectedIds);
    }
  }, [rolePermissions, open]);

  // 切换权限选择
  const togglePermission = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  // 全选/取消全选某个资源的所有权限
  const toggleResourcePermissions = (resource: string, select: boolean) => {
    const newSelected = new Set(selectedPermissions);
    const actions: PermissionAction[] = ["VIEW", "CREATE", "EDIT", "DELETE"];

    actions.forEach((action) => {
      const permissionId = `${resource}_${action}`;
      if (select) {
        newSelected.add(permissionId);
      } else {
        newSelected.delete(permissionId);
      }
    });

    setSelectedPermissions(newSelected);
    setSelectAllResource((prev) => ({ ...prev, [resource]: select }));
  };

  // 保存权限
  const handleSave = async () => {
    try {
      // 建立权限名称到 ID 的映射
      const permissionNameToId = new Map(
        (permissions || []).map((p: any) => [p.name, p.id])
      );

      // 将权限名称（如 USERS_VIEW）转换为 permissionId (UUID)
      const permissionIds = Array.from(selectedPermissions)
        .map((name) => permissionNameToId.get(name))
        .filter((id): id is string => !!id);

      await batchUpdate.mutateAsync({
        roleId,
        permissionIds,
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("保存权限失败:", error);
    }
  };

  // 检查某个资源的所有权限是否都被选中
  const isResourceFullySelected = (resource: string) => {
    const actions: PermissionAction[] = ["VIEW", "CREATE", "EDIT", "DELETE"];
    return actions.every((action) =>
      selectedPermissions.has(`${resource}_${action}`)
    );
  };

  // 检查某个资源的权限是否部分选中
  const isResourcePartiallySelected = (resource: string) => {
    const actions: PermissionAction[] = ["VIEW", "CREATE", "EDIT", "DELETE"];
    const selectedCount = actions.filter((action) =>
      selectedPermissions.has(`${resource}_${action}`)
    ).length;
    return selectedCount > 0 && selectedCount < actions.length;
  };

  // 过滤权限
  const filteredResources = PERMISSION_RESOURCES.filter((resource) =>
    resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (permissionsLoading || rolePermissionsLoading) {
    return (
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="sm:max-w-[700px]">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            编辑角色权限 - {roleName}
          </DialogTitle>
          <DialogDescription>
            为该角色配置相应的系统权限，控制用户可访问的功能
          </DialogDescription>
        </DialogHeader>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-slate-400" />
          <Input
            className="pl-9"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索权限资源..."
            value={searchTerm}
          />
        </div>

        {/* 权限列表 */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {filteredResources.map((resource) => {
              const actions: PermissionAction[] = [
                "VIEW",
                "CREATE",
                "EDIT",
                "DELETE",
              ];
              const isFullySelected = isResourceFullySelected(resource);
              const isPartiallySelected = isResourcePartiallySelected(resource);

              return (
                <div
                  className="rounded-lg border bg-slate-50 p-4"
                  key={resource}
                >
                  {/* 资源标题 + 全选 */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={isFullySelected}
                        onCheckedChange={(checked) => {
                          const newState = checked === true;
                          toggleResourcePermissions(resource, newState);
                          setSelectAllResource((prev) => ({
                            ...prev,
                            [resource]: newState,
                          }));
                        }}
                      />
                      <h3 className="font-semibold text-slate-900">
                        {resource}
                      </h3>
                      {isPartiallySelected && !isFullySelected && (
                        <span className="text-slate-500 text-xs">
                          (部分选中)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 权限操作 */}
                  <div className="ml-6 grid grid-cols-2 gap-2">
                    {actions.map((action) => {
                      const permissionId = `${resource}_${action}`;
                      const isSelected = selectedPermissions.has(permissionId);

                      return (
                        <div
                          className="flex items-center space-x-2 rounded bg-white p-2"
                          key={permissionId}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              togglePermission(permissionId)
                            }
                          />
                          <span className="text-sm">{action}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* 底部统计 */}
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-slate-600 text-sm">
            已选择{" "}
            <span className="font-semibold text-indigo-600">
              {selectedPermissions.size}
            </span>{" "}
            个权限
          </p>
        </div>

        <DialogFooter>
          <Button
            disabled={batchUpdate.isPending}
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            取消
          </Button>
          <Button
            disabled={batchUpdate.isPending}
            onClick={handleSave}
            type="submit"
          >
            {batchUpdate.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                保存权限
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
