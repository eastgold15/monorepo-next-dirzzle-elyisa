"use client";

import type { HeroCardsDTO } from "@repo/contract";
import { Edit, GripVertical, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaSelect } from "@/components/ui/media-select";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useHeroCardsCreate,
  useHeroCardsDelete,
  useHeroCardsList,
  useHeroCardsToggleStatus,
  useHeroCardsUpdate,
} from "@/hooks/api/herocards";

export default function HeroCardsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<
    HeroCardsDTO["Response"] | null
  >(null);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    buttonText: "",
    buttonUrl: "",
    backgroundClass: "bg-blue-50",
    sortOrder: 0,
    isActive: true,
    mediaId: "",
  });

  // 获取首页展示卡片列表
  const { data: cardsData, isLoading, refetch } = useHeroCardsList();

  // 创建首页展示卡片
  const createMutation = useHeroCardsCreate();

  // 更新首页展示卡片
  const updateMutation = useHeroCardsUpdate();

  // 删除首页展示卡片
  const deleteMutation = useHeroCardsDelete();

  // 切换激活状态
  const toggleStatusMutation = useHeroCardsToggleStatus();

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      buttonText: "",
      buttonUrl: "",
      backgroundClass: "bg-blue-50",
      sortOrder: 0,
      isActive: true,
      mediaId: "",
    });
    setEditingCard(null);
  };

  // 打开编辑对话框
  const handleEdit = (card: HeroCardsDTO["Response"]) => {
    setEditingCard(card);
    setFormData({
      title: card.title,
      description: card.description || "",
      buttonText: card.buttonText || "",
      buttonUrl: card.buttonUrl || "",
      backgroundClass: card.backgroundClass || "bg-bjlue-50",
      sortOrder: card.sortOrder ?? 0,
      isActive: card.isActive ?? true,
      mediaId: card.mediaId || "",
    });
  };

  // 保存首页展示卡片
  const handleSave = async () => {
    try {
      const data = {
        title: formData.title,
        description: formData.description,
        buttonText: formData.buttonText,
        buttonUrl: formData.buttonUrl,
        backgroundClass: formData.backgroundClass || undefined,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
        mediaId: formData.mediaId,
      };

      if (editingCard) {
        await updateMutation.mutateAsync({
          id: editingCard.id,
          data,
        });
        toast.success("首页展示卡片更新成功");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("首页展示卡片创建成功");
      }
      resetForm();
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("保存失败:", error);
      toast.error("保存失败");
    }
  };

  // 切换激活状态
  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatusMutation.mutateAsync(id);
      refetch();
    } catch (error) {
      console.error("切换状态失败:", error);
      toast.error("切换状态失败");
    }
  };

  // 删除单个首页展示卡片
  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("首页展示卡片删除成功");
      refetch();
    } catch (error) {
      console.error("删除失败:", error);
      toast.error("删除失败");
    }
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedCards.length === 0) {
      toast.error("请选择要删除的首页展示卡片");
      return;
    }

    try {
      // await batchDeleteMutation.mutateAsync(selectedCards);
      toast.success(`成功删除 ${selectedCards.length} 个首页展示卡片`);
      setSelectedCards([]);
      refetch();
    } catch (error) {
      console.error("批量删除失败:", error);
      toast.error("批量删除失败");
    }
  };

  // 切换选择状态
  const toggleSelect = (id: string) => {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((cardId) => cardId !== id) : [...prev, id]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedCards.length === cardsData?.length) {
      setSelectedCards([]);
    } else {
      setSelectedCards(
        cardsData?.map((card: HeroCardsDTO["Response"]) => card.id) || []
      );
    }
  };

  const cards = cardsData || [];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <nav className="font-medium text-sm">Hero Cards</nav>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold text-3xl">首页展示卡片管理</h1>
                <p className="text-muted-foreground">管理首页展示的卡片内容</p>
              </div>
              <div className="flex gap-2">
                {selectedCards.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        批量删除 ({selectedCards.length})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                          确定要删除选中的 {selectedCards.length}{" "}
                          个首页展示卡片吗？此操作不可撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBatchDelete}>
                          删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <Dialog
                  onOpenChange={(open) => {
                    if (!open) {
                      setIsCreateDialogOpen(false);
                      setEditingCard(null);
                      resetForm();
                    }
                  }}
                  open={isCreateDialogOpen || !!editingCard}
                >
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      新建首页展示卡片
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingCard ? "编辑首页展示卡片" : "新建首页展示卡片"}
                      </DialogTitle>
                      <DialogDescription>
                        填写首页展示卡片信息。带 * 的字段为必填项。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">标题 *</Label>
                          <Input
                            id="title"
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                title: e.target.value,
                              })
                            }
                            placeholder="请输入标题"
                            value={formData.title}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="buttonLabel">按钮文本</Label>
                        <Input
                          id="buttonLabel"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              buttonText: e.target.value,
                            })
                          }
                          placeholder="请输入按钮文本（可选）"
                          value={formData.buttonText}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">描述</Label>
                        <Textarea
                          id="description"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="请输入描述"
                          rows={3}
                          value={formData.description}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="buttonUrl">按钮链接</Label>
                        <Input
                          id="buttonUrl"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              buttonUrl: e.target.value,
                            })
                          }
                          placeholder="请输入按钮链接（可选）"
                          value={formData.buttonUrl}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="backgroundClass">背景样式类</Label>
                        <Input
                          id="backgroundClass"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              backgroundClass: e.target.value,
                            })
                          }
                          placeholder="例如: bg-blue-50"
                          value={formData.backgroundClass}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sortOrder">排序值</Label>
                        <Input
                          id="sortOrder"
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sortOrder:
                                Number.parseInt(e.target.value, 10) || 0,
                            })
                          }
                          placeholder="数字越小越靠前"
                          type="number"
                          value={formData.sortOrder}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>图片</Label>
                        <MediaSelect
                          maxCount={1}
                          onChange={(mediaIds) =>
                            setFormData({
                              ...formData,
                              mediaId: mediaIds[0] || "",
                            })
                          }
                          placeholder="选择图片"
                          value={formData.mediaId ? [formData.mediaId] : []}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.isActive}
                          id="isActive"
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, isActive: checked })
                          }
                        />
                        <Label htmlFor="isActive">启用</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => {
                          setIsCreateDialogOpen(false);
                          setEditingCard(null);
                          resetForm();
                        }}
                        variant="outline"
                      >
                        取消
                      </Button>
                      <Button
                        disabled={
                          !formData.title ||
                          createMutation.isPending ||
                          updateMutation.isPending
                        }
                        onClick={handleSave}
                      >
                        {editingCard ? "更新" : "创建"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>首页展示卡片列表</span>
                  <div className="flex items-center gap-2">
                    <input
                      checked={
                        cards.length > 0 &&
                        selectedCards.length === cards.length
                      }
                      className="rounded"
                      onChange={toggleSelectAll}
                      type="checkbox"
                    />
                    <span className="text-muted-foreground text-sm">
                      全选 ({selectedCards.length}/{cards.length})
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="py-8 text-center">加载中...</div>
                ) : cards.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    暂无首页展示卡片
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cards.map((card) => (
                      <div
                        className={`space-y-3 rounded-lg border p-4 ${
                          selectedCards.includes(card.id)
                            ? "border-primary"
                            : ""
                        }`}
                        key={card.id}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <input
                              checked={selectedCards.includes(card.id)}
                              className="mt-1 rounded"
                              onChange={() => toggleSelect(card.id)}
                              type="checkbox"
                            />
                            <GripVertical className="mt-1 h-5 w-5 text-muted-foreground" />
                            {card.mediaUrl && (
                              <Image
                                alt={card.title}
                                className="h-16 w-16 rounded object-cover"
                                height={40}
                                src={card.mediaUrl}
                                width={40}
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">
                                {card.title}
                              </h3>

                              {card.description && (
                                <p className="mt-1 text-muted-foreground text-sm">
                                  {card.description}
                                </p>
                              )}
                              <div className="mt-2 flex items-center gap-4 text-muted-foreground text-sm">
                                {card.buttonText && (
                                  <span>按钮: {card.buttonText}</span>
                                )}
                                {card.buttonUrl && (
                                  <span>链接: {card.buttonUrl}</span>
                                )}
                                <span>排序: {card.sortOrder}</span>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <Badge
                                  variant={
                                    card.isActive ? "default" : "secondary"
                                  }
                                >
                                  {card.isActive ? "启用" : "禁用"}
                                </Badge>
                                {card.backgroundClass && (
                                  <Badge variant="outline">
                                    {card.backgroundClass}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleToggleStatus(card.id)}
                              size="sm"
                              variant={card.isActive ? "default" : "outline"}
                            >
                              {card.isActive ? "启用" : "禁用"}
                            </Button>
                            <Button
                              onClick={() => handleEdit(card)}
                              size="sm"
                              variant="outline"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    确定要删除首页展示卡片 "{card.title}"
                                    吗？此操作不可撤销。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(card.id)}
                                  >
                                    删除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
