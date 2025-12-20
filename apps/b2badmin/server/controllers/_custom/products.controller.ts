import { ProductsContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { productsService } from "~/modules/index";

export const productsController = new Elysia({
  prefix: "/products",
  tags: ["Products"],
})
  .use(authGuardMid)
  .use(dbPlugin)

  // 获取所有可用的模板
  .get(
    "/templates",
    async ({ query, db, auth }) =>
      await productsService.getTemplates({ db, auth }, query.search),
    {
      query: t.Optional(
        t.Object({
          search: t.Optional(t.String()),
        })
      ),
      detail: {
        summary: "获取所有可用模板",
        description: "获取系统中所有可用的属性模板列表（全局公用）",
        tags: ["Products"],
      },
    }
  )

  // 创建商品（支持站点隔离和模板绑定）
  .post(
    "/",
    async ({ body, db, auth, permissions }) => {
      if (!permissions.includes("PRODUCTS_CREATE"))
        throw new Error("Forbidden");

      const result = await productsService.createProduct(body, { db, auth });

      return {
        id: result.product.id,
        name: result.product.name,
        spuCode: result.product.spuCode,
        status: result.product.status,
        siteProductId: result.siteProduct.id,
        message: "商品创建成功",
      };
    },
    {
      body: t.Object({
        // 商品基础信息
        name: t.String({ minLength: 1, maxLength: 255 }),
        spuCode: t.String({ minLength: 1, maxLength: 64 }),
        description: t.Optional(t.String()),
        status: t.Optional(t.Integer()),
        units: t.Optional(t.String()),

        // 站点分类（必选）
        siteCategoryId: t.String({ format: "uuid" }),

        // 模板（可选）
        templateId: t.Optional(t.String({ format: "uuid" })),

        // 站点商品配置
        price: t.Optional(t.Number()),
        siteName: t.Optional(t.String({ maxLength: 200 })),
        siteDescription: t.Optional(t.String()),
        seoTitle: t.Optional(t.String({ maxLength: 200 })),

        // 图片关联
        imageIds: t.Optional(t.Array(t.String({ format: "uuid" }))),
        mainImageId: t.Optional(t.String({ format: "uuid" })),
      }),
      detail: {
        summary: "创建商品",
        description: "创建新商品并绑定到站点分类，支持选择模板",
        tags: ["Products"],
      },
    }
  )

  // 获取商品列表
  .get(
    "/site",
    async ({ query, db, auth, permissions }) => {
      if (!permissions.includes("PRODUCTS_VIEW")) throw new Error("Forbidden");

      return await productsService.getSiteProducts(query, { db, auth });
    },
    {
      query: t.Object({
        page: t.Optional(t.Number()),
        limit: t.Optional(t.Number()),
        search: t.Optional(t.String()),
        categoryId: t.Optional(t.String()),
      }),
      detail: {
        summary: "获取站点商品列表",
        description: "获取当前站点的商品列表",
        tags: ["Products"],
      },
    }
  )

  // 批量删除商品
  .delete(
    "/batch",
    async ({ body, db, auth, permissions }) => {
      if (!permissions.includes("PRODUCTS_DELETE"))
        throw new Error("Forbidden");

      return await productsService.batchDelete(body.ids, { db, auth });
    },
    {
      body: t.Object({
        ids: t.Array(t.String()),
      }),
      detail: {
        summary: "批量删除商品",
        description: "删除属于当前站点的商品",
        tags: ["Products"],
      },
    }
  )

  // 标准的 CRUD 操作
  .get(
    "/",
    ({ query, permissions, auth, db }) => {
      if (!permissions.includes("PRODUCTS_VIEW")) throw new Error("Forbidden");
      return productsService.findAll(query, { db, auth });
    },
    {
      query: ProductsContract.ListQuery,
      detail: {
        summary: "获取商品列表",
        description: "分页获取商品列表（需要权限）",
        tags: ["Products"],
      },
    }
  )

  .get(
    "/:id",
    ({ params, permissions, auth, db }) => {
      if (!permissions.includes("PRODUCTS_VIEW")) throw new Error("Forbidden");
      return productsService.findOne(params.id, { db, auth });
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "获取商品详情",
        description: "获取指定商品的详细信息（需要权限）",
        tags: ["Products"],
      },
    }
  )

  .patch(
    "/:id",
    ({ params, body, permissions, auth, db }) => {
      if (!permissions.includes("PRODUCTS_EDIT")) throw new Error("Forbidden");
      return productsService.update(params.id, body, { db, auth });
    },
    {
      params: t.Object({ id: t.String() }),
      body: ProductsContract.Patch,
      detail: {
        summary: "更新商品信息",
        description: "更新商品的基本信息（需要权限）",
        tags: ["Products"],
      },
    }
  )

  .delete(
    "/:id",
    ({ params, permissions, auth, db }) => {
      if (!permissions.includes("PRODUCTS_DELETE"))
        throw new Error("Forbidden");
      return productsService.delete(params.id, { db, auth });
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "删除商品",
        description: "删除指定的商品（需要权限）",
        tags: ["Products"],
      },
    }
  );
