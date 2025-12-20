// import type { Treaty } from '@elysiajs/eden'
// import type { rpc } from './rpc'

// /**
//  * RPC 类型辅助工具类
//  * 提供所有后端 API 接口的类型定义和辅助函数
//  */
// export class RpcTypes {
//   // ============ 基础类型 ============
//   static Data<T> = Treaty.Data<T>
//   static Error<T> = Treaty.Error<T>

//   // ============ 用户相关 ============
//   static User = {
//     /** 获取当前用户信息 */
//     me: Treaty.Data<typeof rpc.user.me.get>,
//     /** 创建业务员账号 */
//     createSalesperson: Treaty.Data<typeof rpc.user.management.salesperson.post>,
//     /** 创建工厂管理员账号 */
//     createFactoryAdmin: Treaty.Data < typeof rpc.user.management['factory-admin'].post >,
//     /** 获取可管理的用户列表 */
//     list: Treaty.Data<typeof rpc.user.management.get>,
//     /** 更新用户状态 */
//     updateStatus: Treaty.Data < typeof rpc.user.management[':id'].status.patch >,
//   }

//   // ============ 认证相关 ============
//   static Auth = {
//     /** 登录 */
//     signin: Treaty.Data<typeof rpc.auth.signin.post>,
//     /** 注册 */
//     signup: Treaty.Data<typeof rpc.auth.signup.post>,
//     /** 忘记密码 */
//     forgotPassword: Treaty.Data < typeof rpc.auth['forgot-password'].post >,
//     /** 重置密码 */
//     resetPassword: Treaty.Data < typeof rpc.auth['reset-password'].post >,
//     /** 验证邮箱 */
//     verifyEmail: Treaty.Data < typeof rpc.auth['verify-email'].post >,
//     /** 获取会话 */
//     session: Treaty.Data<typeof rpc.auth.session.get>,
//   }

//   // ============ 工厂管理 ============
//   static Factory = {
//     /** 获取工厂列表 */
//     list: Treaty.Data<typeof rpc.factory.list.get>,
//     /** 创建工厂 */
//     create: Treaty.Data<typeof rpc.factory.post>,
//     /** 更新工厂 */
//     update: Treaty.Data < typeof rpc.factory['factoryId'][':factoryId'].patch >,
//   }

//   // ============ 媒体文件管理 ============
//   static Media = {
//     /** 上传媒体文件 */
//     upload: Treaty.Data<typeof rpc.media.upload.post>,
//     /** 获取媒体文件列表 */
//     list: Treaty.Data<typeof rpc.media.list.get>,
//     /** 删除媒体文件 */
//     delete: Treaty.Data < typeof rpc.media[':id'].delete >,
//     /** 获取存储信息 */
//     storageInfo: Treaty.Data < typeof rpc.media['storage-info'].get >,
//     /** 获取上传令牌 */
//     uploadToken: Treaty.Data < typeof rpc.media['upload-token'].post >,
//   }

//   // ============ 商品管理 ============
//   static Product = {
//     /** 获取商品模板 */
//     templates: Treaty.Data<typeof rpc.product.templates.get>,
//     /** 创建商品 */
//     create: Treaty.Data<typeof rpc.product.post>,
//     /** 获取商品列表 */
//     list: Treaty.Data<typeof rpc.product.get>,
//     /** 批量删除商品 */
//     batchDelete: Treaty.Data<typeof rpc.product.delete>,
//   }

//   // ============ SKU管理 ============
//   static SKU = {
//     /** 批量创建SKU */
//     batchCreate: Treaty.Data<typeof rpc.product.sku.batch.post>,
//     /** 创建SKU */
//     create: Treaty.Data<typeof rpc.product.sku.post>,
//     /** 获取SKU列表 */
//     list: Treaty.Data<typeof rpc.product.sku.get>,
//     /** 更新SKU */
//     update: Treaty.Data < typeof rpc.product.sku[':id'].put >,
//     /** 批量删除SKU */
//     batchDelete: Treaty.Data<typeof rpc.product.sku.delete>,
//     /** 获取SKU详情 */
//     detail: Treaty.Data < typeof rpc.product.sku[':id'].get >,
//     /** 获取商品的SKU列表 */
//     byProduct: Treaty.Data < typeof rpc.product.sku['by-product'][':productId'].get >,
//     /** 更新SKU媒体关联 */
//     updateMedia: Treaty.Data < typeof rpc.product.sku[':id'].media.put >,
//   }

//   // ============ 站点管理 ============
//   static Site = {
//     /** 获取可访问的站点列表 */
//     accessible: Treaty.Data<typeof rpc.site.accessible.get>,
//     /** 创建站点 */
//     create: Treaty.Data<typeof rpc.site.admin.post>,
//     /** 获取站点列表 */
//     list: Treaty.Data<typeof rpc.site.admin.get>,
//     /** 更新站点 */
//     update: Treaty.Data < typeof rpc.site.admin[':siteId'].patch >,
//     /** 删除站点 */
//     delete: Treaty.Data < typeof rpc.site.admin[':siteId'].delete >,
//   }

//   // ============ 站点分类管理 ============
//   static SiteCategory = {
//     /** 获取站点分类列表 */
//     list: Treaty.Data<typeof rpc.site.category.get>,
//     /** 创建站点分类 */
//     create: Treaty.Data<typeof rpc.site.category.post>,
//     /** 更新站点分类 */
//     update: Treaty.Data < typeof rpc.site.category[':id'].put >,
//     /** 批量删除站点分类 */
//     batchDelete: Treaty.Data<typeof rpc.site.category.delete>,
//   }

//   // ============ 站点商品管理 ============
//   static SiteProducts = {
//     /** 获取站点商品列表 */
//     list: Treaty.Data<typeof rpc.site.products.get>,
//     /** 添加商品到站点 */
//     add: Treaty.Data<typeof rpc.site.products.post>,
//     /** 更新站点商品 */
//     update: Treaty.Data < typeof rpc.site.products[':id'].put >,
//     /** 批量删除站点商品 */
//     batchDelete: Treaty.Data<typeof rpc.site.products.delete>,
//     /** 交换商品排序 */
//     swap: Treaty.Data<typeof rpc.site.products.swap.post>,
//   }

//   // ============ 主分类管理 ============
//   static MasterCategory = {
//     /** 获取主分类树 */
//     tree: Treaty.Data < typeof rpc['master-category'].tree.get >,
//     /** 获取主分类列表 */
//     list: Treaty.Data < typeof rpc['master-category'].get >,
//     /** 创建主分类 */
//     create: Treaty.Data < typeof rpc['master-category'].post >,
//     /** 更新主分类 */
//     update: Treaty.Data < typeof rpc['master-category'].update[':id'].put >,
//     /** 批量删除主分类 */
//     batchDelete: Treaty.Data < typeof rpc['master-category'].delete >,
//     /** 获取主分类详情 */
//     detail: Treaty.Data < typeof rpc['master-category'].detail[':id'].get >,
//   }

//   // ============ 属性管理 ============
//   static Attribute = {
//     /** 创建属性 */
//     create: Treaty.Data<typeof rpc.product.attribute.post>,
//     /** 获取属性列表 */
//     list: Treaty.Data<typeof rpc.product.attribute.get>,
//     /** 更新属性 */
//     update: Treaty.Data < typeof rpc.product.attribute[':id'].put >,
//     /** 批量删除属性 */
//     batchDelete: Treaty.Data<typeof rpc.product.attribute.delete>,
//     /** 获取属性及属性值 */
//     withValues: Treaty.Data < typeof rpc.product.attribute['with-values'].get >,
//     /** 获取单个属性详情 */
//     detail: Treaty.Data < typeof rpc.product.attribute['with-values'][':id'].get >,
//   }

//   // ============ 属性值管理 ============
//   static AttributeValue = {
//     /** 创建属性值 */
//     create: Treaty.Data < typeof rpc.product['attribute-value'].post >,
//     /** 获取属性值列表 */
//     list: Treaty.Data < typeof rpc.product['attribute-value'].get >,
//     /** 更新属性值 */
//     update: Treaty.Data < typeof rpc.product['attribute-value'][':id'].put >,
//     /** 删除属性值 */
//     delete: Treaty.Data < typeof rpc.product['attribute-value'][':id'].delete >,
//   }

//   // ============ 模板管理 ============
//   static Template = {
//     /** 创建模板 */
//     create: Treaty.Data<typeof rpc.product.template.post>,
//     /** 获取模板列表 */
//     list: Treaty.Data<typeof rpc.product.template.get>,
//     /** 更新模板 */
//     update: Treaty.Data < typeof rpc.product.template[':id'].put >,
//     /** 批量删除模板 */
//     batchDelete: Treaty.Data<typeof rpc.product.template.delete>,
//     /** 获取分类下的模板 */
//     byCategory: Treaty.Data < typeof rpc.product.template.category[':categoryId'].get >,
//   }

//   // ============ 广告管理 ============
//   static Advertisement = {
//     /** 获取广告列表 */
//     list: Treaty.Data<typeof rpc.advertisements.get>,
//     /** 创建广告 */
//     create: Treaty.Data<typeof rpc.advertisements.post>,
//     /** 更新广告 */
//     update: Treaty.Data < typeof rpc.advertisements[':id'].put >,
//     /** 删除广告 */
//     delete: Treaty.Data < typeof rpc.advertisements[':id'].delete >,
//     /** 批量删除广告 */
//     batchDelete: Treaty.Data < typeof rpc.advertisements['batchDel'].delete >,
//   }

//   // ============ 首页卡片管理 ============
//   static HeroCards = {
//     /** 获取首页展示卡片列表 */
//     list: Treaty.Data < typeof rpc['hero-cards'].get >,
//     /** 创建首页展示卡片 */
//     create: Treaty.Data < typeof rpc['hero-cards'].post >,
//     /** 更新首页展示卡片 */
//     update: Treaty.Data < typeof rpc['hero-cards'][':id'].put >,
//     /** 删除首页展示卡片 */
//     delete: Treaty.Data < typeof rpc['hero-cards'][':id'].delete >,
//     /** 批量删除首页展示卡片 */
//     batchDelete: Treaty.Data < typeof rpc['hero-cards'].batch.delete >,
//   }

//   // ============ 站点配置管理 ============
//   static SiteConfig = {
//     /** 获取配置列表 */
//     list: Treaty.Data < typeof rpc['site-configs'].list.get >,
//     /** 获取所有配置 */
//     all: Treaty.Data < typeof rpc['site-configs'].all.get >,
//     /** 获取配置详情 */
//     detail: Treaty.Data < typeof rpc['site-configs'][':id'].get >,
//     /** 根据键名获取配置 */
//     byKeys: Treaty.Data < typeof rpc['site-configs'].keys.get >,
//     /** 获取分类配置 */
//     byCategory: Treaty.Data < typeof rpc['site-configs'].Category[':Category'].get >,
//     /** 更新配置 */
//     update: Treaty.Data < typeof rpc['site-configs'][':id'].put >,
//     /** 创建配置 */
//     create: Treaty.Data < typeof rpc['site-configs'].post >,
//     /** 删除配置 */
//     delete: Treaty.Data < typeof rpc['site-configs'][':id'].delete >,
//     /** 批量删除配置 */
//     batchDelete: Treaty.Data < typeof rpc['site-configs'].batch.delete >,
//   }

//   // ============ 翻译管理 ============
//   static Translate = {
//     /** 获取翻译列表 */
//     list: Treaty.Data<typeof rpc.translate.list.get>,
//     /** 获取所有翻译 */
//     all: Treaty.Data<typeof rpc.translate.get>,
//     /** 创建翻译 */
//     create: Treaty.Data<typeof rpc.translate.post>,
//     /** 更新翻译 */
//     update: Treaty.Data < typeof rpc.translate[':id'].put >,
//     /** 批量删除翻译 */
//     batchDelete: Treaty.Data<typeof rpc.translate.delete>,
//     /** 获取翻译分类 */
//     categories: Treaty.Data<typeof rpc.translate.categories.get>,
//     /** 获取语言列表 */
//     languages: Treaty.Data<typeof rpc.translate.language.get>,
//   }

//   // ============ 产品统计 ============
//   static ProductStatistics = {
//     /** 获取产品概览统计 */
//     overview: Treaty.Data < typeof rpc['product-statistics'].overview.get >,
//     /** 获取分类统计 */
//     category: Treaty.Data < typeof rpc['product-statistics'].category.get >,
//     /** 获取站点统计 */
//     site: Treaty.Data < typeof rpc['product-statistics'].site.get >,
//     /** 获取趋势统计 */
//     trend: Treaty.Data < typeof rpc['product-statistics'].trend.get >,
//   }
// }

// /**
//  * 类型辅助函数
//  * 用于更方便地获取 API 响应类型
//  */
// export const ApiType = {
//   /** 获取成功的响应数据类型 */
//   success: <T>(type: T) => RpcTypes.Data<T>,

//   /** 获取错误响应类型 */
//   error: <T>(type: T) => RpcTypes.Error<T>,

//   /** 获取响应类型（成功或失败） */
//   response: <T>(type: T) => RpcTypes.Data<T> | RpcTypes.Error<T>,
// }

// /**
//  * 导出所有类型，方便使用
//  */
// export type {
//   // 用户相关类型
//   UserMeResponse = RpcTypes.User['me'],
//     CreateSalespersonResponse = RpcTypes.User['createSalesperson'],
//     CreateFactoryAdminResponse = RpcTypes.User['createFactoryAdmin'],
//     UserListResponse = RpcTypes.User['list'],
//     UpdateUserStatusResponse = RpcTypes.User['updateStatus'],

//     // 媒体文件类型
//     MediaUploadResponse = RpcTypes.Media['upload'],
//     MediaListResponse = RpcTypes.Media['list'],
//     MediaStorageInfoResponse = RpcTypes.Media['storageInfo'],
//     MediaUploadTokenResponse = RpcTypes.Media['uploadToken'],

//     // 商品相关类型
//     ProductTemplatesResponse = RpcTypes.Product['templates'],
//     ProductCreateResponse = RpcTypes.Product['create'],
//     ProductListResponse = RpcTypes.Product['list'],

//     // SKU相关类型
//     SKUListResponse = RpcTypes.SKU['list'],
//     SKUDetailResponse = RpcTypes.SKU['detail'],
//     SKUByProductResponse = RpcTypes.SKU['byProduct'],

//     // 站点相关类型
//     SiteAccessibleResponse = RpcTypes.Site['accessible'],
//     SiteListResponse = RpcTypes.Site['list'],

//     // 分类相关类型
//     MasterCategoryTreeResponse = RpcTypes.MasterCategory['tree'],
//     MasterCategoryListResponse = RpcTypes.MasterCategory['list'],
//     SiteCategoryListResponse = RpcTypes.SiteCategory['list'],

//     // 广告和卡片类型
//     AdvertisementListResponse = RpcTypes.Advertisement['list'],
//     HeroCardsListResponse = RpcTypes.HeroCards['list'],

//     // 统计类型
//     ProductOverviewResponse = RpcTypes.ProductStatistics['overview'],
// }

// /**
//  * 使用示例：
//  *
//  * // 获取用户信息
//  * type UserResponse = typeof rpc.user.me.get
//  * const userData: RpcTypes.User['me'] = await rpc.user.me.get()
//  *
//  * // 上传文件
//  * type UploadResponse = typeof rpc.media.upload.post
//  * const uploadResult: RpcTypes.Media['upload'] = await rpc.media.upload.post(formData)
//  *
//  * // 在组件中使用
//  * interface Props {
//  *   user: RpcTypes.User['me']
//  *   products: RpcTypes.Product['list']
//  * }
//  */
