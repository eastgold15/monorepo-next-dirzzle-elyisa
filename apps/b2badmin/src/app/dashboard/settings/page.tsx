"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import {
  useAccountSettings,
  useUpdateProfile,
  useUpdateSiteInfo,
} from "@/hooks/api/user";

// 表单验证 schema
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "姓名至少需要 2 个字符" }),
  email: z.string().email({ message: "请输入有效的邮箱地址" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

const siteFormSchema = z.object({
  siteName: z.string().min(2, { message: "站点名称至少需要 2 个字符" }),
  domain: z.string().optional(),
  companyName: z.string().min(2, { message: "公司名称至少需要 2 个字符" }),
  companyCode: z.string().min(2, { message: "公司代码至少需要 2 个字符" }),
  companyAddress: z.string().optional(),
  website: z
    .string()
    .url({ message: "请输入有效的网站地址" })
    .optional()
    .or(z.literal("")),
  contactPhone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type SiteFormValues = z.infer<typeof siteFormSchema>;

export default function AccountSettingsPage() {
  const [isMounted, setIsMounted] = useState(false);

  // 获取账号设置信息
  const { data: settingsData, isLoading } = useAccountSettings();

  // 个人资料表单
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
    },
  });

  // 站点和公司信息表单
  const siteForm = useForm<SiteFormValues>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: {
      siteName: "",
      domain: "",
      companyName: "",
      companyCode: "",
      companyAddress: "",
      website: "",
      contactPhone: "",
    },
  });

  // 避免 hydration 错误
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 当用户数据加载完成后，填充表单
  useEffect(() => {
    if (settingsData?.user) {
      profileForm.reset({
        name: settingsData.user.name || "",
        email: settingsData.user.email || "",
        phone: settingsData.user.phone || "",
        address: settingsData.user.address || "",
        city: settingsData.user.city || "",
      });
    }
  }, [settingsData, profileForm]);

  // 当站点数据加载完成后，填充站点表单
  useEffect(() => {
    if (settingsData?.site) {
      const site = settingsData.site;
      const company = settingsData.company;

      siteForm.reset({
        siteName: site.name || "",
        domain: site.domain || "",
        companyName: company?.name || "",
        companyCode: company?.code || "",
        companyAddress: company?.address || "",
        website: company?.website || "",
        contactPhone:
          "contactPhone" in (company || {})
            ? (company as any)?.contactPhone
            : "",
      });
    }
  }, [settingsData, siteForm]);

  // 更新个人资料 mutation
  const updateProfileMutation = useUpdateProfile();

  // 更新站点信息 mutation
  const updateSiteMutation = useUpdateSiteInfo();

  // 提交个人资料表单
  const onProfileSubmit = async (_data: ProfileFormValues) => {
    try {
      await updateProfileMutation.mutateAsync(_data);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
      }
    }
  };

  // 提交站点信息表单
  const onSiteSubmit = async (_data: SiteFormValues) => {
    try {
      await updateSiteMutation.mutateAsync(_data);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
      }
    }
  };

  if (!isMounted) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-16 shrink-0 items-center gap-2">
            <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
              <p className="text-slate-500 text-sm">加载中...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const siteType = settingsData?.site?.siteType;
  const isExporter = siteType === "exporter";
  const isFactory = siteType === "factory";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <nav className="font-medium text-sm">账号设置</nav>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          <div className="space-y-0.5">
            <h2 className="font-bold text-2xl tracking-tight">账号设置</h2>
            <p className="text-muted-foreground text-sm">
              管理您的个人资料、站点信息和公司信息
            </p>
          </div>

          <Separator />

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* 个人资料部分 */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">个人资料</h3>
                  <p className="text-muted-foreground text-sm">
                    更新您的个人信息和联系方式
                  </p>
                </div>

                <Form {...profileForm}>
                  <form
                    className="max-w-2xl space-y-4"
                    onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                  >
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>姓名</FormLabel>
                          <FormControl>
                            <Input placeholder="请输入您的姓名" {...field} />
                          </FormControl>
                          <FormDescription>
                            这是您在系统中显示的名称
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>邮箱</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="请输入您的邮箱"
                              type="email"
                              {...field}
                              disabled
                            />
                          </FormControl>
                          <FormDescription>邮箱地址不可修改</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>电话</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="请输入您的电话号码"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>地址</FormLabel>
                          <FormControl>
                            <Textarea
                              className="resize-none"
                              placeholder="请输入您的地址"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>城市</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="请输入您所在的城市"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      disabled={updateProfileMutation.isPending}
                      type="submit"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          保存中...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          保存个人资料
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>

              <Separator />

              {/* 站点信息部分 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  <div>
                    <h3 className="font-medium text-lg">站点与公司信息</h3>
                    <p className="text-muted-foreground text-sm">
                      {isExporter
                        ? "管理您的站点和出口商信息"
                        : isFactory
                          ? "管理您的站点和工厂信息"
                          : "管理您的站点信息"}
                    </p>
                  </div>
                </div>

                <Form {...siteForm}>
                  <form
                    className="max-w-2xl space-y-4"
                    onSubmit={siteForm.handleSubmit(onSiteSubmit)}
                  >
                    {/* 站点信息 */}
                    <div className="space-y-4 rounded-lg border p-4">
                      <h4 className="font-medium text-sm">站点信息</h4>

                      <FormField
                        control={siteForm.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>站点名称</FormLabel>
                            <FormControl>
                              <Input placeholder="请输入站点名称" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={siteForm.control}
                        name="domain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>域名</FormLabel>
                            <FormControl>
                              <Input placeholder="请输入站点域名" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* 公司信息 */}
                    <div className="space-y-4 rounded-lg border p-4">
                      <h4 className="font-medium text-sm">
                        {isExporter
                          ? "出口商信息"
                          : isFactory
                            ? "工厂信息"
                            : "公司信息"}
                      </h4>

                      <FormField
                        control={siteForm.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {isExporter
                                ? "出口商名称"
                                : isFactory
                                  ? "工厂名称"
                                  : "公司名称"}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={`请输入${isExporter ? "出口商" : isFactory ? "工厂" : "公司"}名称`}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={siteForm.control}
                        name="companyCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {isExporter
                                ? "出口商代码"
                                : isFactory
                                  ? "工厂代码"
                                  : "公司代码"}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={`请输入${isExporter ? "出口商" : isFactory ? "工厂" : "公司"}代码`}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              用于内部识别的唯一代码
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={siteForm.control}
                        name="companyAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>地址</FormLabel>
                            <FormControl>
                              <Textarea
                                className="resize-none"
                                placeholder={`请输入${isExporter ? "出口商" : isFactory ? "工厂" : "公司"}地址`}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={siteForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>网站</FormLabel>
                            <FormControl>
                              <Input placeholder="请输入网站地址" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {isFactory && (
                        <FormField
                          control={siteForm.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>联系电话</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="请输入联系电话"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <Button
                      disabled={updateSiteMutation.isPending}
                      type="submit"
                    >
                      {updateSiteMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          保存中...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          保存站点和公司信息
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
