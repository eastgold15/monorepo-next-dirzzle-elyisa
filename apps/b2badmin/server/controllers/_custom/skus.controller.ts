import { SkusContract } from "@repo/contract";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { authGuardMid } from "~/middleware/auth";
import { skusService } from "~/modules/index";

export const skusController = new Elysia({ prefix: "/skus", tags: ["SKUs"] })
  .use(authGuardMid)
  .use(dbPlugin)

  // 批量创建SKU
  .post(
    "/batch",
    async ({ body: { productId, skus }, db, auth }) => {
      // 验证商品是否存在
      const productExists = await skusService.validateProductExists(
        { db, auth },
        productId
      );
      if (!productExists) {
        throw new HttpError.NotFound("商品不存在");
      }
      // 批量创建SKU
      return await skusService.batchCreateSkus({ db, auth }, productId, skus);
    },
    {
      // allPermission: "SKUS_TABLE_CREATE", // 临时禁用权限检查
      body: SkusContract.BatchCreate,
      detail: {
        summary: "批量创建SKU",
        description: "为商品批量创建SKU",
        tags: ["SKUs"],
      },
    }
  )

  // 更新SKU
  .put(
    "/update/:id",
    async ({ params: { id }, body, db, auth }) => {
      // 更新SKU及媒体关联
      return await skusService.updateSingleSku({ db, auth }, id, body);
    },
    {
      // allPermission: "SKUS_TABLE_UPDATE", // 临时禁用权限检查
      params: t.Object({
        id: t.String(),
      }),
      body: SkusContract.Update,
      detail: {
        summary: "更新SKU",
        description: "更新SKU信息",
        tags: ["SKUs"],
      },
    }
  )

  // 批量删除SKU
  .delete(
    "/batch",
    async ({ body: { ids }, db, user, role, auth }) => {
      // 使用基类的批量删除方法
      const result = await skusService.deleteMany({ db, auth }, ids);
      return result;
    },
    {
      // allPermission: "SKUS_TABLE_DELETE", // 临时禁用权限检查
      body: t.Object({
        ids: t.Array(t.String(), { minItems: 1 }),
      }),
      detail: {
        summary: "批量删除SKU",
        description: "删除选中的SKU",
        tags: ["SKUs"],
      },
    }
  )

  // 获取SKU列表
  .get(
    "/",
    async ({ db, auth, query }) => {
      console.log("query:", query);
      try {
        return await skusService.getSkusList({ db, auth }, query);
      } catch (error) {
        console.log("error:", error);
      }
    },
    {
      allPermission: "SKUS_TABLE_VIEW",
      query: SkusContract.ListQuery,
      detail: {
        summary: "获取SKU列表",
        description: "分页获取SKU列表，业务员只能看到自己工厂商品的SKU",
        tags: ["SKUs"],
      },
    }
  )

  // 获取SKU详情
  .get(
    "/detail/:id",
    async ({ params: { id }, db, user, role, auth }) => {
      // 获取SKU详情
      return await skusService.getSkuDetail({ db, auth }, id);
    },
    {
      allPermission: "SKUS_TABLE_VIEW",
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "获取SKU详情",
        description: "获取SKU详细信息",
        tags: ["SKUs"],
      },
    }
  )

  // 获取商品下的SKU列表（用于商品详情页）
  .get(
    "/product/:productId",
    async ({ params: { productId }, db, user, role, auth }) => {
      // 获取商品下的SKU列表
      return await skusService.getSkusByProduct({ db, auth }, productId);
    },
    {
      allPermission: "SKUS_TABLE_VIEW",
      params: t.Object({
        productId: t.String(),
      }),
      detail: {
        summary: "获取商品SKU列表",
        description: "获取指定商品下的所有SKU",
        tags: ["SKUs"],
      },
    }
  );
