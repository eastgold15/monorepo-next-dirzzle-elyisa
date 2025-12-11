/**
 * 工厂管理后台服务
 * 业务员登录后只能看到和管理自己工厂的内容
 */

import {
  factoriesTable,
  inquiryTable,
  mediaTable,
  productFactoriesTable,
  productsTable,
  salespersonsTable,
} from "@repo/contract/table";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db/connection";

/**
 * 获取工厂的商品列表（业务员只能看到自己工厂的商品）
 */
export async function getFactoryProducts(factoryId: number) {
  const products = await db
    .select()
    .from(productsTable)
    .innerJoin(
      productFactoriesTable,
      eq(productFactoriesTable.productId, productsTable.id)
    )
    .where(
      and(
        eq(productFactoriesTable.factoryId, factoryId),
        eq(productsTable.status, 1) // 只显示上架的商品
      )
    );

  return products;
}

/**
 * 获取工厂的业务员列表
 */
export async function getFactorySalespersons(factoryId: number) {
  const salespersons = await db
    .select()
    .from(salespersonsTable)
    .where(
      and(
        eq(salespersonsTable.factoryId, factoryId),
        eq(salespersonsTable.isActive, true)
      )
    );

  return salespersons;
}

/**
 * 获取工厂的询价列表
 */
export async function getFactoryInquiries(factoryId: number) {
  // 通过商品关联找到工厂的询价
  const inquiries = await db
    .select({
      inquiryId: inquiryTable.id,
      customerName: inquiryTable.customerName,
      companyName: inquiryTable.companyName,
      email: inquiryTable.email,
      phone: inquiryTable.phone,
      status: inquiryTable.status,
      createdAt: inquiryTable.createdAt,
      productId: productsTable.id,
      productName: productsTable.name,
    })
    .from(inquiryTable)
    .innerJoin(
      inquiryItemsTable,
      eq(inquiryItemsTable.inquiryId, inquiryTable.id)
    )
    .innerJoin(
      productFactoriesTable,
      eq(productFactoriesTable.productId, inquiryItemsTable.skuId)
    )
    .innerJoin(productsTable, eq(productsTable.id, inquiryItemsTable.skuId))
    .where(
      and(
        eq(productFactoriesTable.factoryId, factoryId),
        eq(inquiryTable.status, "sent")
      )
    )
    .orderBy(inquiryTable.createdAt);

  return inquiries;
}

/**
 * 获取工厂的媒体文件列表
 */
export async function getFactoryMedia(factoryId: number) {
  // 通过产品关联找到工厂的媒体文件
  const media = await db
    .select()
    .from(mediaTable)
    .innerJoin(
      productFactoriesTable,
      eq(productFactoriesTable.productId, mediaTable.productId)
    )
    .where(eq(productFactoriesTable.factoryId, factoryId));

  return media;
}

/**
 * 检查用户是否有权限访问该工厂
 */
export async function checkFactoryAccess(
  userId: number,
  factoryId: number
): Promise<boolean> {
  // 检查用户是否是该工厂的业务员
  const [user] = await db
    .select()
    .from(salespersonsTable)
    .where(
      and(
        eq(salespersonsTable.id, userId),
        eq(salespersonsTable.factoryId, factoryId),
        eq(salespersonsTable.isActive, true)
      )
    )
    .limit(1);

  return !!user;
}

/**
 * 获取用户的工厂信息
 */
export async function getUserFactory(userId: number) {
  const [user] = await db
    .select({
      factoryId: factoriesTable.id,
      factoryName: factoriesTable.name,
      factoryAddress: factoriesTable.address,
      factoryPhone: factoriesTable.contactPhone,
      userName: salespersonsTable.name,
      userEmail: salespersonsTable.email,
      userPosition: salespersonsTable.position,
      isAdmin: salespersonsTable.isAdmin,
      canUpload: salespersonsTable.canUpload,
      canEdit: salespersonsTable.canEdit,
    })
    .from(salespersonsTable)
    .innerJoin(
      factoriesTable,
      eq(factoriesTable.id, salespersonsTable.factoryId)
    )
    .where(
      and(
        eq(salespersonsTable.id, userId),
        eq(salespersonsTable.isActive, true)
      )
    )
    .limit(1);

  return user;
}
