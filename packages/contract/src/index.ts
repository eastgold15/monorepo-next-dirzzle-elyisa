/**
 * @repo/contract 主入口文件
 *
 * 契约层 - 统一的 Zod Schema 和类型管理系统
 */

export { AuthModel } from "./modules/01auth/auth.model";
// 新增模块导出
export { ExporterModel } from "./modules/01exporter/exporter.model";
export { FactoryModel } from "./modules/01factory/factory.model";
export { SalespersonModel } from "./modules/01factory/sales_person.model";
// ==================== Model 导出 ====================
export { AdsModel } from "./modules/ads/ads.model";
export { CategoryModel } from "./modules/category/category.model";
export { ClientModel } from "./modules/customer/customer.model";
export * from "./modules/helper/constant";
export * from "./modules/helper/query-types";
export * from "./modules/helper/utils";
export * from "./modules/helper/utils.types";
export { HeroCardsModel } from "./modules/hero-cards/hero-cards.model";
export { ImageModel } from "./modules/image/images.model";
export { InquiryModel } from "./modules/inquiry/inquiry.model";
export { InquiryItemModel } from "./modules/inquiry/inquiryItem.model";
export { OssModel } from "./modules/oss/oss.model";
export {
  AttributeModel,
  AttributeTemplateModel,
  AttributeValueModel,
} from "./modules/product/attribute.model";
export {
  ProductImagesModel,
  ProductModel,
  ProductTemplateModel,
} from "./modules/product/product.model";
export { SkuModel } from "./modules/product/sku.model";
export { ProductStatisticsModel } from "./modules/product-statistics/product-statistics.model";
export { QuotationModel } from "./modules/quotation/quotation.model";
export { QuotationItemModel } from "./modules/quotation/quotation_item.model";
export { SiteConfigModel } from "./modules/site-config/site-config.model";
export { TranslationDictModel } from "./modules/translations/translate.model";
export { UploadModel } from "./modules/upload/upload.model";
// ==================== 工具导出 ====================

export {
  FileType,
  MediaModel,
  StorageProvider,
} from "./modules/media/media.model";
