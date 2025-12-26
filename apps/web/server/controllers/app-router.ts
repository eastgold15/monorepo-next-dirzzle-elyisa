/**
 * 🤖 【路由挂载器 - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 静态链式调用，保证 Eden Treaty 类型推断完美。
 * --------------------------------------------------------
 */
import type { Elysia } from "elysia";
import { adsController } from "./_custom/ads.controller";
import { herocardsController } from "./_custom/herocards.controller";
import { inquiryController } from "./_custom/inquiry.controller";
import { mediaController } from "./_custom/media.controller";
import { productsController } from "./_custom/products.controller";
import { sitecategoriesController } from "./_custom/sitecategories.controller";
// import { accountController } from "./_generated/account.controller";
import { attributeController } from "./_generated/attribute.controller";
import { attributetemplateController } from "./_generated/attributetemplate.controller";
import { attributevalueController } from "./_generated/attributevalue.controller";
// import { customerController } from "./_generated/customer.controller";
// import { dailyinquirycounterController } from "./_generated/dailyinquirycounter.controller";
import { exportersController } from "./_generated/exporters.controller";
import { factoriesController } from "./_generated/factories.controller";
import { inquiryitemsController } from "./_generated/inquiryitems.controller";
import { masterController } from "./_generated/master.controller";
import { mediametadataController } from "./_generated/mediametadata.controller";
// import { permissionController } from "./_generated/permission.controller";
import { productmastercategoriesController } from "./_generated/productmastercategories.controller";
import { productmediaController } from "./_generated/productmedia.controller";
import { productsitecategoriesController } from "./_generated/productsitecategories.controller";
import { quotationitemsController } from "./_generated/quotationitems.controller";
import { quotationsController } from "./_generated/quotations.controller";
// import { roleController } from "./_generated/role.controller";
// import { rolepermissionsController } from "./_generated/rolepermissions.controller";
import { salespersonaffiliationsController } from "./_generated/salespersonaffiliations.controller";
// import { salespersoncategoriesController } from "./_generated/salespersoncategories.controller";
import { salespersonsController } from "./_generated/salespersons.controller";
import { siteconfigController } from "./_generated/siteconfig.controller";
import { siteproductsController } from "./_generated/siteproducts.controller";
import { sitesController } from "./_generated/sites.controller";
import { skumediaController } from "./_generated/skumedia.controller";
import { skusController } from "./_generated/skus.controller";

export const appRouter = (app: Elysia) =>
  app
    // .use(customerController)
    // .use(accountController)

    // .use(dailyinquirycounterController)

    // .use(permissionController)

    // .use(producttemplateController)

    // .use(rolepermissionsController)
    // .use(roleController)

    // .use(sessionController)

    // .use(translationdictController)
    // .use(usersiterolesController)
    // .use(usersController)
    // .use(verificationController);
    .use(adsController)
    .use(attributeController)
    .use(attributetemplateController)
    .use(attributevalueController)
    .use(salespersonaffiliationsController)
    // .use(salespersoncategoriesController)
    .use(salespersonsController)
    .use(productsController)
    .use(exportersController)
    .use(factoriesController)
    .use(herocardsController)
    .use(inquiryitemsController)
    .use(productmastercategoriesController)
    .use(masterController)
    .use(mediametadataController)
    .use(mediaController)
    .use(productmediaController)
    .use(productsitecategoriesController)
    .use(quotationitemsController)
    .use(quotationsController)
    .use(sitecategoriesController)
    .use(siteconfigController)
    .use(siteproductsController)
    .use(sitesController)
    .use(skumediaController)
    .use(skusController)
    .use(inquiryController);
