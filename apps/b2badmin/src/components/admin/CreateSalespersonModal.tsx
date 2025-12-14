"use client";

import { UserPlus } from "lucide-react";
import { useState } from "react";
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
import { usePermissions } from "@/hooks/api/user";

interface CreateSalespersonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateSalespersonModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateSalespersonModalProps) {
  const { role, getAccessibleFactoryIds } = usePermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 验证密码
    if (formData.password !== formData.confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (formData.password.length < 8) {
      setError("密码至少需要8个字符");
      return;
    }

    if (!formData.factoryId) {
      setError("请选择所属工厂");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/salesperson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          position: formData.position,
          factoryId: formData.factoryId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "创建业务员失败");
        return;
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
      console.error("创建业务员失败:", err);
      setError("网络错误，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            创建业务员账号
          </DialogTitle>
          <DialogDescription>
            为您的工厂创建新的业务员账号。业务员将只能管理您分配的商品和分类。
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
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
                placeholder="至少8个字符"
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
              disabled={isLoading}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              取消
            </Button>
            <Button disabled={isLoading} type="submit">
              {isLoading ? "创建中..." : "创建业务员"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
