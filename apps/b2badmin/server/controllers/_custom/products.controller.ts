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
  // 创建商品（支持站点隔离和模板绑定）
  .post(
    "/",
    async ({ body, db, auth }) => {
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
      allPermission: "PRODUCTS_TABLE_CREATE",
      body: ProductsContract.Create,
      detail: {
        summary: "创建商品",
        description: "创建新商品并绑定到站点分类，支持选择模板",
        tags: ["Products"],
      },
    }
  )

  // 获取商品列表
  .get(
    "/",
    async ({ query, db, auth, permissions }) =>
      await productsService.getSiteProducts(query, { db, auth }),
    {
      allPermission: "PRODUCTS_TABLE_VIEW",
      query: ProductsContract.ListQuery,
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
    async ({ body, db, auth, permissions }) =>
      await productsService.batchDelete(body.ids, { db, auth }),
    {
      allPermission: "PRODUCTS_TABLE_DELETE",
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

  .put(
    "/:id",
    ({ params, body, permissions, auth, db }) =>
      productsService.updateProduct(params.id, body, { db, auth }),
    {
      allPermission: "PRODUCTS_TABLE_EDIT",
      params: t.Object({ id: t.String() }),
      body: ProductsContract.Update,
      detail: {
        summary: "更新商品信息",
        description: "更新商品的基本信息和媒体关联（需要权限）",
        tags: ["Products"],
      },
    }
  )

  .delete(
    "/:id",
    ({ params, permissions, auth, db }) =>
      productsService.delete(params.id, { db, auth }),
    {
      allPermission: "PRODUCTS_TABLE_DELETE",
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "删除商品",
        description: "删除指定的商品（需要权限）",
        tags: ["Products"],
      },
    }
  );
