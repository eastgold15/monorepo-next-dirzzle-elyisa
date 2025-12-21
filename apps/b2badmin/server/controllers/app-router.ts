/**
 * 🤖 【路由挂载器 - 自动生成】
 * --------------------------------------------------------
 * 🛠️ 严禁使用 Object.values 循环挂载，否则会失去 Eden Treaty 类型。
 * 🚀 此文件通过静态链式调用保证完美的类型推断。
 * --------------------------------------------------------
 */
import type { Elysia } from "elysia";
import { mediaController } from "./_custom/media.controller";
import { productsController } from "./_custom/products.controller";
import { usersController } from "./_custom/users.controller";
import { usersiterolesController } from "./_custom/usersiteroles.controller";
import { quotationitemsController } from "./_generated/quotationitems.controller";
import { quotationsController } from "./_generated/quotations.controller";
import { roleController } from "./_generated/role.controller";
import { rolepermissionsController } from "./_generated/rolepermissions.controller";
import { salespersonaffiliationsController } from "./_generated/salespersonaffiliations.controller";
import { salespersoncategoriesController } from "./_generated/salespersoncategories.controller";
import { salespersonsController } from "./_generated/salespersons.controller";
import { translationdictController } from "./_generated/translationdict.controller";

export const appRouter = (app: Elysia) =>
  app
    // .use(customerController)
    // .use(accountController)
    // .use(adsController)
    // .use(attributeController)
    // .use(attributetemplateController)
    // .use(attributevalueController)
    // .use(dailyinquirycounterController)
    // .use(exportersController)
    // .use(factoriesController)
    // .use(herocardsController)
    // .use(inquiryitemsController)
    // .use(inquiryController)
    // .use(masterController)
    // .use(mediametadataController)
    .use(mediaController)
    // .use(permissionController)
    // .use(productmastercategoriesController)
    // .use(productmediaController)
    // .use(producttemplateController)
    .use(productsController)
    .use(quotationitemsController)
    .use(quotationsController)
    .use(rolepermissionsController)
    .use(roleController)
    .use(salespersonaffiliationsController)
    .use(salespersoncategoriesController)
    .use(salespersonsController)
    // .use(sessionController)
    // .use(sitecategoriesController)
    // .use(siteconfigController)
    // .use(siteproductsController)
    // .use(sitesController)
    // .use(skumediaController)
    // .use(skusController)
    .use(translationdictController)
    .use(usersiterolesController)
    .use(usersController);
// .use(verificationController);
