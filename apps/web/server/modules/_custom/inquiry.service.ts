/**
 * ✍️ 【WEB Service - 业务自定义】
 * --------------------------------------------------------
 * 💡 你可以在此重写基类方法或添加私有业务逻辑。
 * 🛡️ 自动化脚本永远不会覆盖此文件。
 * --------------------------------------------------------
 */
/**
 * ✍️ 【WEB Service - 业务自定义】
 * --------------------------------------------------------
 * 💡 处理复杂的询价提交流程：客户管理、媒体保存、Excel生成、邮件分发。
 * --------------------------------------------------------
 */
import {
  CustomerTable,
  factoriesTable,
  type InquiryWithItems,
  inquiryItemsTable,
  inquiryTable,
  mediaTable,
  salespersonCategoriesTable,
  salespersonsTable,
} from "@repo/contract";
import { eq, inArray } from "drizzle-orm";
import { HttpError } from "elysia-http-problem-json";
import type { ServiceContext } from "~/lib/base-service";
import { sendEmail } from "~/lib/email/email";
import { InquiryGeneratedService } from "../_generated/inquiry.service";
import {
  type QuotationData,
  quotationDefaultData,
} from "../inquiry/excelTemplate/QuotationData";
import { generateInquiryNumber } from "../inquiry/services/dayCount";
import { generateQuotationExcel } from "../inquiry/services/excel.service";
import { createSalesInquiryTemplate } from "../inquiry/services/inquiry.templates";
import { generateTimeNo } from "../inquiry/utils/timeNoGenerator";

// 外部业务工具

export class InquiryService extends InquiryGeneratedService {
  /**
   * 🛡️ 核心方法：处理全流程询价提交
   */
  async submit(body: any, ctx: ServiceContext) {
    const { db, siteId } = ctx;

    try {
      // 1. 客户信息 Upsert
      const clientId = await this.handleCustomerUpsert(body, ctx);

      // 2. 生成询价单号并创建主表
      const inquiryNo = await generateInquiryNumber();
      const [newInquiry] = await db
        .insert(inquiryTable)
        .values({
          id: inquiryNo,
          customerName: body.customerName,
          customerCompany: body.customerCompany,
          customerEmail: body.customerEmail,
          customerPhone: body.customerPhone,
          customerWhatsapp: body.customerWhatsapp,
          status: "pending",
          siteId, // 显式注入站点隔离
        })
        .returning();

      // 3. 处理媒体/图片
      const mediaId = await this.processMedia(
        body.sku.media,
        body.productDesc || body.productName,
        ctx
      );

      // 4. 创建询价子项
      const [newInquiryItem] = await db
        .insert(inquiryItemsTable)
        .values({
          inquiryId: newInquiry.id,
          skuId: body.sku.productId,
          skuQuantity: body.quantity,
          productName: body.productName || "",
          productDescription: body.productDesc,
          skuImage: mediaId,
          skuPrice: body.sku.price,
          paymentMethod: body.paymentMethod,
          customerRequirements: body.customerRemarks,
        })
        .returning();

      // 5. 聚合工厂与业务员数据并执行分发
      await this.handleNotificationFlow(newInquiry, newInquiryItem, body, ctx);

      return {
        success: true,
        inquiryId: newInquiry.id,
        inquiryNumber: `INQ${newInquiry.id.toString().padStart(6, "0")}`,
        message: "询价提交成功，我们将尽快与您联系",
      };
    } catch (error: any) {
      console.error("❌ Inquiry Submission Failed:", error);
      throw new HttpError.InternalServerError(error.message || "询价提交失败");
    }
  }

  /**
   * 内部方法：处理客户增量更新
   */
  private async handleCustomerUpsert(body: any, ctx: ServiceContext) {
    const [existing] = await ctx.db
      .select()
      .from(CustomerTable)
      .where(eq(CustomerTable.email, body.customerEmail))
      .limit(1);

    const data = {
      companyName: body.customerCompany,
      name: body.customerEmail.split("@")[0],
      phone: body.customerPhone,
      whatsapp: body.customerWhatsapp,
      siteId: ctx.siteId,
    };

    if (existing) {
      await ctx.db
        .update(CustomerTable)
        .set(data)
        .where(eq(CustomerTable.id, existing.id));
      return existing.id;
    }
    const [newClient] = await ctx.db
      .insert(CustomerTable)
      .values({ ...data, email: body.customerEmail })
      .returning();
    return newClient.id;
  }

  /**
   * 内部方法：处理媒体库
   */
  private async processMedia(media: any, alt: string, ctx: ServiceContext) {
    if (!media?.url) return null;
    const [existing] = await ctx.db
      .select()
      .from(mediaTable)
      .where(eq(mediaTable.url, media.url))
      .limit(1);
    if (existing) return existing.id;

    const [newMedia] = await ctx.db
      .insert(mediaTable)
      .values({
        url: media.url,
        type: media.type || "image",
        alt: alt || "",
        siteId: ctx.siteId,
      })
      .returning();
    return newMedia.id;
  }

  /**
   * 内部方法：处理工厂查找、Excel生成及邮件分发
   */
  private async handleNotificationFlow(
    inquiry: any,
    item: any,
    body: any,
    ctx: ServiceContext
  ) {
    const { db } = ctx;

    // 1. 获取产品关联的工厂和分类
    const product = await db.query.productsTable.findFirst({
      where: eq((db as any).id, body.productId),
      with: { productCategories: { with: { category: true } } },
    });
    if (!product?.factoryId) throw new Error("Product factory not found");

    const categoryIds = product.productCategories.map((pc) => pc.category.id);

    // 2. 获取工厂链 (主工厂 + 相似工厂)
    const mainFactory = await db.query.factoriesTable.findFirst({
      where: eq(factoriesTable.id, product.factoryId),
    });
    const similarFactories = await db.query.factoriesTable.findMany({
      where: eq(factoriesTable.isActive, true),
      limit: 2,
    });
    const factories = [mainFactory, ...similarFactories].filter(Boolean);

    // 3. 下载图片并生成 Excel
    const photoData = await this.downloadImage(body.sku.media?.url);
    const timeNo = await generateTimeNo();
    const excelBuffer = await generateQuotationExcel(
      this.mapQuotationData(inquiry, item, body, factories, photoData, timeNo)
    );

    // 4. 匹配业务员
    const salesReps = await this.matchSalesReps(categoryIds, ctx);
    if (salesReps.length === 0) throw new Error("No available sales reps");

    // 5. 发送邮件
    const inquiryWithItems = this.mapInquiryPreview(inquiry, item, body);
    const template = createSalesInquiryTemplate(
      inquiryWithItems,
      inquiry.id,
      salesReps[0].user,
      factories
    );

    await sendEmail({
      to: salesReps[0].user.email,
      cc: salesReps
        .slice(1)
        .map((r) => r.user.email)
        .filter(Boolean),
      template: {
        ...template,
        attachments: [
          {
            filename: `询价单-${timeNo}.xlsx`,
            content: excelBuffer,
            contentType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        ],
      },
    });

    // 6. 记录分配时间
    await db
      .update(salespersonsTable)
      .set({ lastAssignedAt: new Date() })
      .where(
        inArray(
          salespersonsTable.id,
          salesReps.map((r) => r.id)
        )
      );

    await db
      .update(inquiryTable)
      .set({ status: "sent" })
      .where(eq(inquiryTable.id, inquiry.id));
  }

  private async downloadImage(url?: string) {
    if (!url) return null;
    try {
      const resp = await fetch(url);
      if (!resp.ok) return null;
      return {
        buffer: Buffer.from(await resp.arrayBuffer()),
        mimeType: resp.headers.get("content-type") || "image/jpeg",
      };
    } catch {
      return null;
    }
  }

  private async matchSalesReps(categoryIds: string[], ctx: ServiceContext) {
    const reps = await ctx.db.query.salespersonsTable.findMany({
      where: eq(salespersonsTable.isActive, true),
      with: {
        user: true,
        assignedCategories: {
          where: inArray(salespersonCategoriesTable.categoryId, categoryIds),
        },
      },
    });

    return reps
      .filter((r) => r.assignedCategories.length > 0)
      .sort(
        (a, b) =>
          (a.lastAssignedAt?.getTime() ?? 0) -
          (b.lastAssignedAt?.getTime() ?? 0)
      )
      .slice(0, 3);
  }

  private mapQuotationData(
    inquiry: any,
    item: any,
    body: any,
    factories: any[],
    photo: any,
    timeNo: string
  ): QuotationData {
    return {
      ...quotationDefaultData,
      factoryName: factories[0]?.name,
      factoryAddr1: factories[0]?.address,
      clientFullName: inquiry.customerName,
      clientEmail: inquiry.customerEmail,
      photoForRefer: photo
        ? {
            buffer: photo.buffer,
            mimeType: photo.mimeType,
            name: `prod-${inquiry.id}`,
          }
        : null,
      termsCode1: item.id,
      termsDesc1: item.productDescription,
      termsUnits1: item.skuQuantity.toString(),
      termsUsd1: Number.parseFloat(body.sku.price).toFixed(2),
      termsUSD: item.skuQuantity * Number.parseFloat(body.sku.price),
      timeNo: inquiry.id,
    };
  }

  private mapInquiryPreview(
    inquiry: any,
    item: any,
    body: any
  ): InquiryWithItems {
    return {
      ...inquiry,
      itemCount: 1,
      items: [{ ...item, skuImage: body.sku.media?.url || "" }],
    };
  }
}
