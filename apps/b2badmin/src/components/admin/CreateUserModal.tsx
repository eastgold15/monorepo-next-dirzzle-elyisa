"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { Building2, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { FactorySelector } from "@/components/auth/FactorySelector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateFactoryAdmin,
  useCreateSalesperson,
} from "@/hooks/api/use-user-api";
import { useIsExporterAdmin } from "@/stores/user-store";

type CreateModalType = "salesperson" | "factory_admin";

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  modalType?: CreateModalType;
}

export function CreateUserModal({
  open,
  onOpenChange,
  onSuccess,
  modalType = "salesperson",
}: CreateUserModalProps) {
  const isExporterAdmin = useIsExporterAdmin();
  const createSalesperson = useCreateSalesperson();
  const createFactoryAdmin = useCreateFactoryAdmin();
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<CreateModalType>(modalType);

  // 表单数据
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    position: "",
    factoryId: "",
  });

  // 当 modalType 改变时更新 userType
  useEffect(() => {
    setUserType(modalType);
  }, [modalType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 验证密码
    if (formData.password !== formData.confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (formData.password.length < 6) {
      setError("密码至少需要6个字符");
      return;
    }

    if (!formData.factoryId) {
      setError("请选择所属工厂");
      return;
    }

    try {
      if (userType === "salesperson") {
        await createSalesperson.mutateAsync({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          factoryId: formData.factoryId,
        });
      } else {
        await createFactoryAdmin.mutateAsync({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          factoryId: formData.factoryId,
        });
      }

      // 创建成功
      onOpenChange(false);
      onSuccess?.();

      // 重置表单
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        position: "",
        factoryId: "",
      });
    } catch (err) {
      console.error(
        `创建${userType === "salesperson" ? "业务员" : "工厂管理员"}失败:`,
        err
      );
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {userType === "factory_admin" ? (
              <Building2 className="h-5 w-5" />
            ) : (
              <UserPlus className="h-5 w-5" />
            )}
            {userType === "factory_admin" ? "创建工厂管理员" : "创建业务员"}
          </DialogTitle>
          <DialogDescription>
            {userType === "factory_admin"
              ? "为指定工厂创建新的管理员账号。工厂管理员将拥有该工厂的完整管理权限。"
              : "为指定工厂创建新的业务员账号。业务员将只能管理您分配的商品和分类。"}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* 用户类型选择器 - 仅出口商管理员可见 */}
          {isExporterAdmin && (
            <div className="space-y-2">
              <Label>用户类型 *</Label>
              <Select
                onValueChange={(value: CreateModalType) => setUserType(value)}
                value={userType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择用户类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salesperson">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      业务员
                    </div>
                  </SelectItem>
                  <SelectItem value="factory_admin">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      工厂管理员
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名 *</Label>
              <Input
                id="name"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="请输入业务员姓名"
                required
                value={formData.name}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">邮箱 *</Label>
              <Input
                id="email"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="example@email.com"
                required
                type="email"
                value={formData.email}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">密码 *</Label>
              <Input
                id="password"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="至少6个字符"
                required
                type="password"
                value={formData.password}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码 *</Label>
              <Input
                id="confirmPassword"
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="再次输入密码"
                required
                type="password"
                value={formData.confirmPassword}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">电话</Label>
              <Input
                id="phone"
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="请输入手机号码"
                value={formData.phone}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">职位</Label>
              <Input
                id="position"
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                placeholder="如：销售经理"
                value={formData.position}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>所属工厂 *</Label>
            <FactorySelector
              className="w-full"
              onChange={(factoryId) => setFormData({ ...formData, factoryId })}
              value={formData.factoryId}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              disabled={
                createSalesperson.isPending || createFactoryAdmin.isPending
              }
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              取消
            </Button>
            <Button
              disabled={
                createSalesperson.isPending || createFactoryAdmin.isPending
              }
              type="submit"
            >
              {createSalesperson.isPending || createFactoryAdmin.isPending
                ? "创建中..."
                : userType === "factory_admin"
                  ? "创建工厂管理员"
                  : "创建业务员"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// 向后兼容的导出
export const CreateSalespersonModal = CreateUserModal;
