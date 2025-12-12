/**
 * @repo/contract 主入口文件
 *
 * 契约层 - 统一的 TypeBox Schema 和类型管理系统
 */

// 权限系统导出
export type { UserRole, Permission, DataScope, UserPermission } from "./modules/auth/permissions.t.model";

export { AuthTModel as AuthModel } from "./modules/01auth/auth.t.model";
// 新增模块导出
export { ExporterTModel as ExporterModel } from "./modules/01exporter/Exporter.t.model";
export { FactoryTModel as FactoryModel } from "./modules/01factory/factory.t.model";
export { SalesPersonTModel as SalespersonModel } from "./modules/01factory/sales_person.t.model";
// ==================== Model 导出 ====================
export { AdsTModel as AdsModel } from "./modules/ads/ads.t.model";
export { CategoryTModel as CategoryModel } from "./modules/category/category.t.model";
export { ClientTModel as ClientModel } from "./modules/customer/customer.t.model";
export * from "./modules/helper/constant";
export * from "./modules/helper/query-types.t.model";

export * from "./modules/helper/utils.types";
export { HeroCardsTModel as HeroCardsModel } from "./modules/hero-cards/hero-cards.t.model";
export { ImageTModel as ImageModel } from "./modules/image/images.t.model";
export { InquiryTModel as InquiryModel } from "./modules/inquiry/inquiry.t.model";
export { InquiryItemTModel as InquiryItemModel } from "./modules/inquiry/inquiryItem.t.model";
export { OssTModel as OssModel } from "./modules/oss/oss.t.model";
export {
  AttributeTemplateTModel as AttributeTemplateModel,
  AttributeTModel as AttributeModel,
  AttributeValueTModel as AttributeValueModel,
} from "./modules/product/attribute.t.model";
export { ProductTModel as ProductModel } from "./modules/product/product.t.model";
export { SkuTModel as SkuModel } from "./modules/product/sku.t.model";
export { ProductStatisticsTModel as ProductStatisticsModel } from "./modules/product-statistics/product-statistics.t.model";
export { QuotationTModel as QuotationModel } from "./modules/quotation/quotation.t.model";
export { QuotationItemTModel as QuotationItemModel } from "./modules/quotation/quotation_item.t.model";
export { SiteConfigTModel as SiteConfigModel } from "./modules/site-config/site-config.t.model";
export { TranslationDictTModel as TranslationDictModel } from "./modules/translations/translate.t.model";
export { UploadTModel as UploadModel } from "./modules/upload/upload.t.model";
// ==================== 工具导出 ====================

export {
  FileType,
  MediaTModel as MediaModel,
  StorageProvider,
} from "./modules/media/media.t.model";
