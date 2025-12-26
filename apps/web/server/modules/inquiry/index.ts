import {
  CustomerTable,
  factoriesTable,
  InquiryContract,
  type InquiryDTO,
  inquiryItemsTable,
  inquiryTable,
  productsTable,
  salespersonCategoriesTable,
  salespersonsTable,
} from "@repo/contract";
import { and, eq, inArray } from "drizzle-orm";
import Elysia from "elysia";
import { HttpError } from "elysia-http-problem-json";
import { dbPlugin } from "~/db/connection";
import { sendEmail } from "../../lib/email/email";
import {
  type QuotationData,
  quotationDefaultData,
} from "./excelTemplate/QuotationData";
import { generateInquiryNumber } from "./services/dayCount";
import { generateQuotationExcel } from "./services/excel.service";
import { createSalesInquiryTemplate } from "./services/inquiry.templates";
import { generateTimeNo } from "./utils/timeNoGenerator";

export const inquiryRoute = new Elysia({ prefix: "inquiry" })
  .use(dbPlugin)
  .post(
    "/",
    async ({
      db,
      body: {
        productDesc,
        productId,
        paymentMethod,
        quantity,
        sku,
        customerName,
        customerCompany,
        customerPhone,
        customerWhatsapp,
        customerRemarks,
        customerEmail,
        productName,
      },
    }) => {
      try {
        // === 1. 处理客户信息 ===
        let clientId: string;
        const [existingClient] = await db
          .select()
          .from(CustomerTable)
          .where(eq(CustomerTable.email, customerEmail))
          .limit(1);

        if (existingClient) {
          clientId = existingClient.id;
          await db
            .update(CustomerTable)
            .set({
              companyName: customerCompany,
              name: customerEmail.split("@")[0],
              phone: customerPhone,
              whatsapp: customerWhatsapp,
            })
            .where(eq(CustomerTable.id, clientId));
        } else {
          const [newClient] = await db
            .insert(CustomerTable)
            .values({
              companyName: customerCompany,
              name: customerEmail.split("@")[0],
              email: customerEmail,
              phone: customerPhone,
              whatsapp: customerWhatsapp,
            })
            .returning({ id: CustomerTable.id });
          clientId = newClient.id;
        }

        // === 2. 创建询价主记录 ===

        const inquiry_id = await generateInquiryNumber();

        const [newInquiry] = await db
          .insert(inquiryTable)
          .values({
            id: inquiry_id,
            customerName,
            customerCompany,
            customerEmail,
            customerPhone,
            customerWhatsapp,
            status: "pending",
          })
          .returning({
            id: inquiryTable.id,
            createdAt: inquiryTable.createdAt,
          });

        // === 3. 创建询价项 ===
        const [newInquiryItem] = await db
          .insert(inquiryItemsTable)
          .values({
            inquiryId: newInquiry.id,
            skuId: sku.productId,
            skuQuantity: quantity,
            productName: productName || "",
            productDescription: productDesc,
            skuImage: sku.media.url || "",
            skuPrice: sku.price,
            paymentMethod,
            customerRequirements: customerRemarks,
          })
          .returning({
            id: inquiryItemsTable.id,
            createdAt: inquiryItemsTable.createdAt,
          });

        // === 4. 获取工厂信息 ===
        const productQuery = await db.query.productsTable.findFirst({
          columns: { factoryId: true },
          with: {
            productCategories: {
              columns: {},
              with: { category: { columns: { id: true } } },
            },
          },
          where: eq(productsTable.id, productId),
        });

        if (!productQuery?.factoryId) {
          throw new HttpError.NotFound("商品未关联工厂或不存在");
        }

        const categoryIds = productQuery.productCategories.map(
          (item) => item.category.id
        );
        const factoryId = productQuery.factoryId;

        // 主工厂
        const mainFactory = await db.query.factoriesTable.findFirst({
          columns: {
            name: true,
            address: true,
            website: true,
            contactPhone: true,
          },
          where: eq(factoriesTable.id, factoryId),
        });
        if (!mainFactory) throw new HttpError.NotFound("主工厂信息缺失");

        // 相似工厂（最多2家，凑够3家 total）
        // 暂时移除按分类筛选的逻辑，因为 factoriesTable 没有 categoryId 字段
        const similarFactories = await db.query.factoriesTable.findMany({
          columns: { address: true, website: true },
          where: eq(factoriesTable.isActive, true),
          limit: 2,
        });

        const factories = [mainFactory, ...similarFactories];

        // === 5. 下载商品图片 ===
        let photoBuffer: Buffer | null = null;
        let mimeType = "image/jpeg";

        if (sku.media.url) {
          try {
            const response = await fetch(sku.media.url);
            if (response.ok) {
              mimeType = response.headers.get("content-type") || "image/jpeg";
              photoBuffer = Buffer.from(await response.arrayBuffer()) as Buffer;
            }
          } catch (error) {
            console.error("【警告】图片下载失败:", error);
          }
        }

        // === 6. 构建报价单数据 ===
        const timeNo = await generateTimeNo();
        const inquiryData: QuotationData = {
          ...quotationDefaultData,

          // 主工厂
          ...(mainFactory.name?.trim() && { factoryName: mainFactory.name }),
          ...(mainFactory.address?.trim() && {
            factoryAddr1: mainFactory.address,
          }),
          ...(mainFactory.website?.trim() && {
            factoryWeb1: mainFactory.website,
          }),
          factoryPhone: mainFactory.contactPhone,
          // 相似工厂（仅地址和网站）
          ...(factories[1]?.address?.trim() && {
            factoryAddr2: factories[1].address,
          }),
          ...(factories[1]?.website?.trim() && {
            factoryWeb2: factories[1].website,
          }),
          ...(factories[2]?.address?.trim() && {
            factoryAddr3: factories[2].address,
          }),
          ...(factories[2]?.website?.trim() && {
            factoryWeb3: factories[2].website,
          }),

          // 支付与客户
          payWay: paymentMethod || "",
          clientCompanyName: customerCompany || "",
          clientFullName: customerName,
          clientEmail: customerEmail,
          clientPhone: customerPhone,

          clientWhatsApp: customerWhatsapp.toString(),

          // 图片
          photoForRefer: photoBuffer
            ? {
                buffer: photoBuffer,
                mimeType,
                name: `product-${productId}-${Date.now()}`,
              }
            : null,

          // 商品行
          termsCode1: newInquiryItem.id,
          termsDesc1: productDesc || productName || "",
          termsUnits1: quantity.toString(),
          termsUsd1: Number.parseFloat(sku.price).toFixed(2),
          termsRemark1: customerRemarks,
          termsTTL: quantity,
          termsUSD: quantity * Number.parseFloat(sku.price),

          // 其他
          timeNo: inquiry_id,
        };

        const excelBuffer = await generateQuotationExcel(inquiryData);

        // 查询工厂管理员的邮箱

        // === 7. 查找业务员并发送邮件 ===
        if (categoryIds.length === 0) {
          throw new Error("商品没有分类");
        }

        //  根据商品的分类查找业务员

        const SalesReps = await db.query.salespersonsTable.findMany({
          with: {
            assignedCategories: {
              with: {
                salesperson: true,
              },
            },
            user: true,
          },
          where: and(
            inArray(salespersonCategoriesTable.categoryId, categoryIds),
            eq(salespersonsTable.isActive, true)
          ),
        });

        // 去重 + 限3人
        const seen = new Set<string>();
        const uniqueSalesReps = SalesReps.filter((rep: any) => {
          if (seen.has(rep.userId)) return false;
          seen.add(rep.userId);
          return true;
        })
          .sort((a: any, b: any) => {
            // 从未分配的排前面（null 视为最早）
            const aTime = a.lastAssignedAt?.getTime() ?? 0;
            const bTime = b.lastAssignedAt?.getTime() ?? 0;
            return aTime - bTime; // 升序：越早（或 null）越靠前
          })
          .slice(0, 3);

        const inquiryWithItems: InquiryDTO["Create"] = {
          customerName,
          customerCompany,
          customerEmail,
          customerPhone,
          customerWhatsapp: customerWhatsapp.toString(),
          status: "pending",

          items: [
            {
              createdAt: newInquiryItem.createdAt,
              inquiryId: newInquiry.id,
              skuId: sku.productId,
              skuPrice: sku.price,
              productName: productName || "",
              productDescription: productDesc || "",
              skuImage: sku.media?.url || "",
              skuQuantity: quantity,
              paymentMethod,
              customerRequirements: customerRemarks,
            },
          ],
        };

        if (uniqueSalesReps.length === 0) {
          throw new Error("No active sales reps found.");
        }

        const to = uniqueSalesReps[0].user.email;
        const cc = uniqueSalesReps
          .slice(1)
          .map((rep) => rep.user.email)
          .filter((email) => !!email);

        const salesTemplate = createSalesInquiryTemplate(
          inquiryWithItems,
          newInquiry.id,
          uniqueSalesReps[0].user, // 主负责人
          factories
        );

        await sendEmail({
          to,
          cc: cc.length > 0 ? cc : undefined,
          template: {
            ...salesTemplate,
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

        // ✅ 更新所有被选中的业务员的 lastAssignedAt
        await db
          .update(salespersonsTable)
          .set({ lastAssignedAt: new Date() })
          .where(
            inArray(
              salespersonsTable.id,
              uniqueSalesReps.map((r) => r.id)
            )
          );

        // === 8. 更新状态 ===
        await db
          .update(inquiryTable)
          .set({ status: "sent" })
          .where(eq(inquiryTable.id, newInquiry.id));

        return {
          success: true,
          inquiryId: newInquiry.id,
          inquiryNumber: `INQ${newInquiry.id.toString().padStart(6, "0")}`,
          message: "询价提交成功，我们将尽快与您联系",
        };
      } catch (error) {
        console.error("❌ 询价提交失败:", error);
        throw new HttpError.InternalServerError("询价提交失败，请稍后重试");
      }
    },
    {
      body: InquiryContract.Create,
      detail: {
        tags: ["inquiry"],
        summary: "提交用户询价单",
        description:
          "把用户信息存到数据库client表和inquiry表中，生成Excel询价表，使用email发送给出口商的业务员。",
      },
    }
  );
