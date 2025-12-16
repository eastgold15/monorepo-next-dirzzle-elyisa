import { AdsTModel } from "@repo/contract";
import { adsTable } from "@repo/contract/table";
import { and, eq, inArray, like } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { db, dbPlugin } from "@/server/db/connection";
import { commonRes } from "@/server/utils/Res";

// 获取广告列表
async function getAdvertisementList(params: AdsTModel["ListQuery"]) {
  const {
    page = 1,
    limit = 10,
    sort = "sortOrder",
    sortOrder = "asc",
    search,
    type,
    position,
    isActive,
  } = params;

  // 使用关系查询
  const advertisements = await db.query.adsTable.findMany({
    where: {
      ...(search && {
        title: { like: `%${search}%` }
      }),
      ...(type && {
        type
      }),
      ...(position && {
        position
      }),
      ...(isActive !== undefined && isActive !== null && {
        isActive
      }),
      with: {
        imageRef: {
          columns: {
            url: true,
          },
        },
      },
      orderBy: [
        {
          createdAt: 'desc',
          sortOrder: 'desc'
        }
      ],
      limit,
      offset: (page - 1) * limit,
    }
  });

  // 获取总数
  const totalCountResult = await db
    .select({ count: adsTable.id })
    .from(adsTable)
    .where(
      and(
        ...(search ? [like(adsTable.title, `%${search}%`)] : []),
        ...(type ? [eq(adsTable.type, type)] : []),
        ...(position ? [eq(adsTable.position, position)] : []),
        ...(isActive !== undefined && isActive !== null
          ? [eq(adsTable.isActive, isActive)]
          : [])
      )
    );

  const total = totalCountResult[0]?.count || 0;

  // 格式化返回数据
  const formattedItems = advertisements.map((ad) => ({
    ...ad,
    imageUrl: ad.image_id?.url,
  }));

  return {
    items: formattedItems,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// 根据ID获取广告详情
async function getAdvertisementById(id: string) {
  const advertisement = await db.query.adsTable.findFirst({
    where: { id },
    with: {
      imageRef: {
        columns: {
          url: true,
        },
      },
    },
  });

  if (!advertisement) {
    throw new HttpError.NotFound("广告不存在");
  }

  return {
    ...advertisement,
    imageUrl: advertisement.imageRef?.url,
  };
}

// 创建广告
async function createAdvertisement(data: AdsTModel["Create"]) {
  if (!data.image_id || data.image_id.length === 0) {
    throw new HttpError.BadRequest("请上传图片");
  }

  // 设置默认值
  const advertisementData = {
    ...data,
    startDate: data.startDate,
    endDate: data.endDate,
    sortOrder: data.sortOrder ?? 0,
    isActive: data.isActive ?? true,
    image_id: data.image_id[0]!,
  };

  const [newAd] = await db
    .insert(adsTable)
    .values(advertisementData)
    .returning();

  if (!newAd) {
    throw new Error("创建广告失败");
  }

  return newAd;
}

// 更新广告
async function updateAdvertisement(id: string, data: AdsTModel["Update"]) {
  const updateData: Partial<typeof adsTable.$inferInsert> = {
    ...data,
    image_id: data.image_id ? data.image_id[0] : undefined,
    startDate: data.startDate,
    endDate: data.endDate,
  };

  const result = await db
    .update(adsTable)
    .set(updateData)
    .where(eq(adsTable.id, id))
    .returning();

  if (result.length === 0) {
    throw new Error("广告不存在");
  }

  return result[0];
}

// 批量删除广告
async function batchDeleteAdvertisement(ids: string[]) {
  await db.delete(adsTable).where(inArray(adsTable.id, ids));
}

// 获取当前时间段的轮播图广告
async function getCurrentCarouselAds(): Promise<AdsTModel["Entity"][]> {
  const now = new Date();

  const advertisements = await db.query.adsTable.findMany({
    where: {
      type: "carousel",
      isActive: true,
    },
    with: {
      imageRef: {
        columns: {
          url: true,
        },
      },
    },
    orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.createdAt)],
  });

  // 过滤出在有效时间范围内的广告
  const validAds = advertisements.filter((ad) => {
    const startDate = new Date(ad.startDate);
    const endDate = new Date(ad.endDate);
    return startDate <= now && endDate >= now;
  });

  // 格式化返回数据
  return validAds.map((ad) => ({
    ...ad,
    imageUrl: ad.imageRef?.url,
  }));
}

// 删除广告
async function deleteAdvertisement(id: string) {
  const result = await db
    .delete(adsTable)
    .where(eq(adsTable.id, id))
    .returning();

  if (result.length === 0) {
    throw new Error("广告不存在");
  }

  return result[0];
}

/**
 * 广告控制器
 * 处理广告相关的HTTP请求
 */
export const AdsController = new Elysia({
  prefix: "/advertisements",
})
  .use(dbPlugin)
  // 获取广告列表 - RESTful标准设计，支持类型筛选
  .get(
    "/",
    async ({ query }) => {
      const result = await getAdvertisementList(query);
      return commonRes(result);
    },
    {
      query: AdsTModel.ListQuery,
      detail: {
        summary: "获取广告列表",
        description:
          "获取广告列表，支持分页、搜索和筛选。使用type=banner获取Banner广告，type=carousel获取轮播图广告",
        tags: ["Advertisements"],
      },
    }
  )

  // 根据ID获取广告详情
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const advertisement = await getAdvertisementById(id);
      return commonRes(advertisement);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "获取广告详情",
        description: "根据ID获取广告详细信息",
        tags: ["Advertisements"],
      },
    }
  )

  // 创建广告
  .post(
    "/",
    async ({ body }) => {
      const advertisement = await createAdvertisement(body);
      return commonRes(advertisement, 201);
    },
    {
      body: AdsTModel.Create,
      detail: {
        summary: "创建广告",
        description: "创建新的广告",
        tags: ["Advertisements"],
      },
    }
  )

  // 更新广告
  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      const advertisement = await updateAdvertisement(id, body);
      return commonRes(advertisement);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: AdsTModel.Update,
      detail: {
        summary: "更新广告",
        description: "更新指定ID的广告信息",
        tags: ["Advertisements"],
      },
    }
  )

  // 删除广告
  .delete(
    "/:id",
    async ({ params: { id } }) => {
      const advertisement = await deleteAdvertisement(id);
      return commonRes(advertisement);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        summary: "删除广告",
        description: "删除指定ID的广告",
        tags: ["Advertisements"],
      },
    }
  )

  .delete(
    "/batchDel",
    async ({ body }) => {
      await batchDeleteAdvertisement(body.ids);
      return commonRes({ message: "批量删除成功" });
    },
    {
      body: t.Object({
        ids: t.Array(t.String()),
      }),
      detail: {
        summary: "批量删除广告",
        description: "批量删除指定ID的广告",
        tags: ["Advertisements"],
      },
    }
  )

  // 获取当前时间段的轮播图广告
  .get(
    "/carousel/current",
    async () => {
      const advertisements = await getCurrentCarouselAds();
      return commonRes(advertisements);
    },
    {
      detail: {
        summary: "获取当前轮播图广告",
        description: "获取当前时间段内有效的轮播图广告，用于首页展示",
        tags: ["Advertisements"],
      },
    }
  );
