/**
 * 🤖 【路由挂载器 - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 静态链式调用，保证 Eden Treaty 类型推断完美。
 * --------------------------------------------------------
 */
import type { Elysia } from "elysia";
import { adsController } from "./_custom/ads.controller";
import { attributeController } from "./_custom/attribute.controller";
import { attributetemplateController } from "./_custom/attributetemplate.controller";
import { factoriesController } from "./_custom/factories.controller";
import { herocardsController } from "./_custom/herocards.controller";
import { masterController } from "./_custom/master.controller";
import { mediaController } from "./_custom/media.controller";
import { permissionController } from "./_custom/permission.controller";
import { productmastercategoriesController } from "./_custom/productmastercategories.controller";
import { productsController } from "./_custom/products.controller";
import { roleController } from "./_custom/role.controller";
import { rolepermissionsController } from "./_custom/rolepermissions.controller";
import { salespersonsController } from "./_custom/salespersons.controller";
import { sitecategoriesController } from "./_custom/sitecategories.controller";
import { siteconfigController } from "./_custom/siteconfig.controller";
import { sitesController } from "./_custom/sites.controller";
import { skusController } from "./_custom/skus.controller";
import { usersController } from "./_custom/users.controller";
import { usersiterolesController } from "./_custom/usersiteroles.controller";
import { accountController } from "./_generated/account.controller";
import { attributevalueController } from "./_generated/attributevalue.controller";
import { customerController } from "./_generated/customer.controller";
import { dailyinquirycounterController } from "./_generated/dailyinquirycounter.controller";
import { exportersController } from "./_generated/exporters.controller";
import { inquiryController } from "./_generated/inquiry.controller";
import { inquiryitemsController } from "./_generated/inquiryitems.controller";
import { mediametadataController } from "./_generated/mediametadata.controller";
import { productmediaController } from "./_generated/productmedia.controller";
import { productsitecategoriesController } from "./_generated/productsitecategories.controller";
import { producttemplateController } from "./_generated/producttemplate.controller";
import { quotationitemsController } from "./_generated/quotationitems.controller";
import { quotationsController } from "./_generated/quotations.controller";
import { salespersonaffiliationsController } from "./_generated/salespersonaffiliations.controller";
import { salespersoncategoriesController } from "./_generated/salespersoncategories.controller";
import { sessionController } from "./_generated/session.controller";
import { siteproductsController } from "./_generated/siteproducts.controller";
import { skumediaController } from "./_generated/skumedia.controller";
// import { translationdictController } from "./_generated/translationdict.controller";
import { verificationController } from "./_generated/verification.controller";

export const appRouter = (app: Elysia) =>
  app
    .use(customerController)
    .use(accountController)
    .use(adsController)
    .use(attributeController)
    .use(attributetemplateController)
    .use(attributevalueController)
    .use(dailyinquirycounterController)
    .use(exportersController)
    .use(factoriesController)
    .use(herocardsController)
    .use(inquiryitemsController)
    .use(inquiryController)
    .use(masterController)
    .use(mediametadataController)
    .use(mediaController)
    .use(permissionController)
    .use(productmastercategoriesController)
    .use(productmediaController)
    .use(productsitecategoriesController)
    .use(producttemplateController)
    .use(productsController)
    .use(quotationitemsController)
    .use(quotationsController)
    .use(rolepermissionsController)
    .use(roleController)
    .use(salespersonaffiliationsController)
    .use(salespersoncategoriesController)
    .use(salespersonsController)
    .use(sessionController)
    .use(sitecategoriesController)
    .use(siteconfigController)
    .use(siteproductsController)
    .use(sitesController)
    .use(skumediaController)
    .use(skusController)
    // .use(translationdictController)
    .use(usersiterolesController)
    .use(usersController)
    .use(verificationController);
