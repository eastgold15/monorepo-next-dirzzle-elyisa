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
  type InquiryContract,
  inquiryItemsTable,
  inquiryTable,
  mediaTable,
  salespersonsTable,
} from "@repo/contract";
import { eq, type InferSelectModel } from "drizzle-orm";
import { HttpError } from "elysia-http-problem-json";
import { db } from "~/db/connection";
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

// 外部业务工具

// 方式：通过 Parameters 获取回调参数类型
type TransactionFn = Parameters<(typeof db)["transaction"]>[0];
type TxType = Parameters<TransactionFn>[0];
type BestSalesperson = Awaited<
  ReturnType<typeof InquiryService.prototype.findBestSalesperson>
>;
type Inquiry = InferSelectModel<typeof inquiryTable>;
type InquiryItem = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  skuId: string;
  inquiryId: string;
  productName: string;
  productDescription: string | null;
  skuQuantity: number;
  skuPrice: string | null;
  paymentMethod: string;
  customerRequirements: string | null;
};
export class InquiryService extends InquiryGeneratedService {
  /**
   * 🚀 询价提交：事务处理 + 分单逻辑
   */
  async submit(
    body: typeof InquiryContract.Create.static,
    ctx: ServiceContext
  ) {
    const { siteId } = ctx;

    // 1. 先在事务外（或事务内）查出 SKU 的真实信息
    const skuData = await db.query.skusTable.findFirst({
      where: {
        id: body.skuId,
      },
      with: { media: true }, // 假设 SKU 关联了媒体表
    });
    if (!skuData) {
      throw new HttpError.BadRequest("Invalid SKU ID");
    }
    const result = await db.transaction(async (tx) => {
      // 1. 客户管理 (Upsert)
      const customerId = await this.upsertCustomer(body, ctx, tx);

      // 2. 生成业务单号 (TimeNo) 和 匹配业务员
      const inquiryId = await generateInquiryNumber();
      const targetRep = await this.findBestSalesperson(body.productId, ctx, tx);
      // 3. 创建主表 (将 timeNo 存入 id 或特定的 inquiryNumber 字段)
      // 注意：这里我假设你用生成的 timeNo 作为主键或者存储字段
      const [newInquiry] = await tx
        .insert(inquiryTable)
        .values({
          inquiryNumber: inquiryId,
          customerName: body.customerName,
          customerCompany: body.customerCompany,
          customerEmail: body.customerEmail,
          customerPhone: body.customerPhone,
          customerWhatsapp: body.customerWhatsapp,
          status: "pending",
          siteId,
          // 核心归属逻辑：
          ownerId: targetRep?.userId || null, // 找到就给业务员，没找到留空
          isPublic: !targetRep, // 没找到则进入公海
        })
        .returning();

      // 4. 创建子项
      const [newItem] = await tx
        .insert(inquiryItemsTable)
        .values({
          inquiryId: newInquiry.id,
          skuId: body.skuId,
          skuQuantity: body.quantity,
          productName: body.productName,
          productDescription: body.productDesc,
          skuPrice: skuData.price,
          paymentMethod: body.paymentMethod,
          customerRequirements: body.customerRemarks,
        })
        .returning();

      // 5. 更新业务员分配时间 (防止连续塞给同一个人)
      if (targetRep) {
        await this.notifyAndLog(targetRep, newInquiry, body, ctx, tx);
      }

      return { targetRep, inquiry: newInquiry, item: newItem };
    });

    // 6. 事务外：异步执行耗时任务（邮件、Excel）
    if (result.targetRep) {
      this.sendFullInquiryEmail(
        result.targetRep,
        result.inquiry,
        result.item,
        body,
        skuData.media[0]?.url // 传入真实的媒体地址
      ).catch(console.error);
    }

    return {
      success: true,
      inquiryNumber: result.inquiry.id,
      assignedTo: result.targetRep?.user?.name || "Public Pool",
    };
  }

  /**
   * 🔍 匹配算法：分类优先 + 最闲优先 (Round Robin)
   */
  async findBestSalesperson(
    productId: string,
    ctx: ServiceContext,
    tx: TxType
  ) {
    // A. 获取产品的分类
    const product = await tx.query.productsTable.findFirst({
      where: {
        id: productId,
      },
      with: {
        masterCategories: true,
      },
    });

    if (!product?.masterCategories.length) return null;
    const categoryIds = product.masterCategories.map((c) => c.id);

    // B. 寻找匹配这些分类的活跃业务员 (Drizzle 1.0 语法)
    const candidates = await tx.query.salespersonsTable.findMany({
      where: {
        isActive: true,
      },
      with: {
        user: true,
        masterCategories: {
          where: {
            id: {
              in: categoryIds,
            },
          },
        },
      },
    });

    // C. 过滤并排序：取最后一次分配时间最早的人 (最闲的人)
    const sorted = candidates
      .filter((r) => r.masterCategories.length > 0)
      .sort((a, b) => {
        const timeA = a.lastAssignedAt?.getTime() ?? 0;
        const timeB = b.lastAssignedAt?.getTime() ?? 0;
        return timeA - timeB;
      });

    return sorted[0] || null;
  }

  /**
   * 📧 通知与状态更新
   */
  private async notifyAndLog(
    rep: BestSalesperson,
    inquiry: Inquiry,
    body: typeof InquiryContract.Create.static,
    ctx: ServiceContext,
    tx: TxType
  ) {
    // 更新业务员最后分配时间，防止下个单子又塞给同一个人
    await tx
      .update(salespersonsTable)
      .set({ lastAssignedAt: new Date() })
      .where(eq(salespersonsTable.id, rep!.id));

    // 修改单据状态为“已分发/待处理”
    await tx
      .update(inquiryTable)
      .set({ status: "sent" })
      .where(eq(inquiryTable.id, inquiry.id));
  }

  /**
   * 👤 客户 Upsert 逻辑
   */
  private async upsertCustomer(
    body: typeof InquiryContract.Create.static,
    ctx: ServiceContext,
    tx: TxType
  ) {
    const [existing] = await tx
      .select()
      .from(CustomerTable)
      .where(eq(CustomerTable.email, body.customerEmail))
      .limit(1);

    const customerData = {
      companyName: body.customerCompany,
      name: body.customerName,
      email: body.customerEmail,
      phone: body.customerPhone,
      whatsapp: body.customerWhatsapp,
      siteId: ctx.siteId,
    };

    if (existing) {
      await tx
        .update(CustomerTable)
        .set(customerData)
        .where(eq(CustomerTable.id, existing.id));
      return existing.id;
    }

    const [newCustomer] = await tx
      .insert(CustomerTable)
      .values({ ...customerData, email: body.customerEmail })
      .returning();
    return newCustomer.id;
  }

  /**
   * 📧 异步完整通知逻辑 (包含 Excel 和工厂逻辑)
   */
  private async sendFullInquiryEmail(
    targetRep: BestSalesperson,
    inquiry: Inquiry,
    item: InquiryItem,
    body: typeof InquiryContract.Create.static,
    skuImageUrl?: string // 👈 增加图片参数
  ) {
    // 1. 获取工厂信息
    const product = await db.query.productsTable.findFirst({
      where: { id: body.productId },
      with: { masterCategories: { with: { sites: true } } },
    });
    const allFactories = Array.from(
      new Set(
        product?.masterCategories.flatMap((c) => c.sites).filter(Boolean) || []
      )
    ).filter((f) => f.isActive);
    const factories = allFactories.slice(0, 3);
    // 下载后端查询到的真实图片
    const photoData = await this.downloadImage(skuImageUrl);

    // 🔥 修正点：直接使用 inquiry.id (即之前的 timeNo) 传入 Excel 映射
    const excelBuffer = await generateQuotationExcel(
      this.mapQuotationData(
        inquiry,
        item,
        body,
        factories,
        photoData,
        inquiry.id
      )
    );
    if (!targetRep?.user) {
      return;
    }

    // 预览数据中的图片也改用后端查到的
    const inquiryPreview = {
      ...inquiry,
      items: [{ ...item, skuImage: skuImageUrl || "" }],
    };
    const template = createSalesInquiryTemplate(
      inquiryPreview,
      inquiry.id,
      targetRep!.user,
      factories
    );

    await sendEmail({
      to: targetRep!.user.email,
      template: {
        ...template,
        attachments: [
          {
            filename: `Inquiry-${inquiry.id}.xlsx`,
            content: excelBuffer,
            contentType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        ],
      },
    });
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
      factoryName: factories[0]?.name || "TBD",
      clientFullName: inquiry.customerName,
      clientEmail: inquiry.customerEmail,
      photoForRefer: photo
        ? {
            buffer: photo.buffer,
            mimeType: photo.mimeType,
            name: `prod-${inquiry.id}`,
          }
        : null,
      timeNo, // 👈 现在这里正确使用了业务单号
      termsCode1: item.id,
      termsDesc1: item.productDescription,
      termsUnits1: item.skuQuantity.toString(),
      termsUsd1: Number.parseFloat(body.sku.price).toFixed(2),
      termsUSD: item.skuQuantity * Number.parseFloat(body.sku.price),
    };
  }
}
