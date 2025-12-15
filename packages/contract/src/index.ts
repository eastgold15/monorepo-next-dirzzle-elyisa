/**
 * @repo/contract 主入口文件
 *
 * 契约层 - 统一的 TypeBox Schema 和类型管理系统
 */

// ==================== Auth 模块导出 ====================
export { AuthTModel as AuthModel } from "./modules/auth/auth.t.model";
// 权限系统导出
export type {
  DataScope,
  Permission,
  UserPermission,
  UserRole,
} from "./modules/auth/permission.t.model";
export { UserTeamTModel as UserTeamModel } from "./modules/auth/user-team.t.model";
// ==================== Company 模块导出 ====================
export { ExporterTModel as ExporterModel } from "./modules/company/exporter.t.model";
export { FactoryTModel as FactoryModel } from "./modules/company/factory.t.model";
export { SalesPersonTModel as SalespersonModel } from "./modules/company/sales_person.t.model";
// ==================== Content 模块导出 ====================
export { AdsTModel as AdsModel } from "./modules/content/ads.t.model";
export { HeroCardsTModel as HeroCardsModel } from "./modules/content/hero-cards.t.model";
export { ClientTModel as ClientModel } from "./modules/customer/customer.t.model";
// ==================== Helper 模块导出 ====================
export * from "./modules/helper/constant";
export * from "./modules/helper/query-types.t.model";
export * from "./modules/helper/utils.types";
// ==================== Inquiry 模块导出 ====================
export { InquiryTModel as InquiryModel } from "./modules/inquiry/inquiry.t.model";
export { InquiryItemTModel as InquiryItemModel } from "./modules/inquiry/inquiryItem.t.model";

// ==================== Media 模块导出 ====================
export {
  FileType,
  MediaTModel as MediaModel,
  StorageProvider,
} from "./modules/media/media.t.model";
export { OssTModel as OssModel } from "./modules/media/oss.t.model";
// ==================== Product 模块导出 ====================
export {
  AttributeTemplateTModel as AttributeTemplateModel,
  AttributeTModel as AttributeModel,
  AttributeValueTModel as AttributeValueModel,
} from "./modules/product/attribute.t.model";
export { CategoryTModel as CategoryModel } from "./modules/product/category.t.model";
export { ProductTModel as ProductModel } from "./modules/product/product.t.model";
export { ProductStatisticsTModel as ProductStatisticsModel } from "./modules/product/product-statistics.t.model";
export { SkuTModel as SkuModel } from "./modules/product/sku.t.model";

// ==================== Quotation 模块导出 ====================
export { QuotationTModel as QuotationModel } from "./modules/quotation/quotation.t.model";
export { QuotationItemTModel as QuotationItemModel } from "./modules/quotation/quotation_item.t.model";

// ==================== System 模块导出 ====================
export { SiteConfigTModel as SiteConfigModel } from "./modules/system/site-config.t.model";
export { TranslationDictTModel as TranslationDictModel } from "./modules/system/translate.t.model";

// ==================== 数据库关系导出 ====================
export { relations } from "./table.relation";
