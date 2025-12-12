/**
 * 模拟真实询价场景的测试脚本
 * 模拟用户提交询价单时的数据
 */

import fs from "node:fs";
import path from "node:path";
import {
  type QuotationData,
  quotationDefaultData,
} from "../../excelTemplate/QuotationData";
import { generateQuotationExcel } from "../excel.service";

// 模拟真实用户提交的询价数据
const mockInquiryData = {
  // 用户信息
  email: "sarah.johnson@fashionstore.com",
  company: "Fashion Store Inc.",
  phone: "+15551234567",
  whatsapp: "+15551234567",
  remarks: "Need samples before bulk order. Please quote CIF Los Angeles port.",

  // 商品信息
  productId: "SHOE-2024-001",
  productName: "High Quality Leather Boots",
  productDesc:
    "Genuine leather boots for winter, waterproof, fur-lined interior",
  sku: {
    productId: "SHOE-2024-001",
    price: "45.80",
    media: {
      url: "https://example.com/images/boots.jpg",
    },
  },
  paymentMethod: "T/T",
  quantity: 1000,
  unit: "pairs",
};

// 创建模拟询价ID（通常从数据库生成）
const mockInquiryId = 12_345;

// 生成Excel数据
function createQuotationData(
  inquiryData: typeof mockInquiryData,
  inquiryid: string
): QuotationData {
  return {
    ...quotationDefaultData,

    // 客户信息
    clientCompanyName: inquiryData.company,
    clientFullName: inquiryData.email.split("@")[0],
    clientEmail: inquiryData.email,
    clientPhone: Number.parseInt(inquiryData.phone.replace(/\D/g, ""), 10) || 0,
    clientWhatsApp: inquiryData.whatsapp,

    // 商品信息 - 只填充第一行（对应实际询价的商品）
    termsCode1: inquiryId,
    termsDesc1: inquiryData.productDesc || inquiryData.productName,
    termsUnits1: inquiryData.unit,
    termsUsd1: Number.parseFloat(inquiryData.sku.price).toFixed(2),
    termsRemark1: inquiryData.remarks,

    // 计算总金额
    termsTTL: inquiryData.quantity * Number.parseFloat(inquiryData.sku.price),
    termsUSD: inquiryData.quantity * Number.parseFloat(inquiryData.sku.price),

    // 更新日期
    date: new Date().toISOString().split("T")[0],
  };
}

async function testRealInquiryScenario() {
  try {
    console.log("🚀 模拟真实询价场景...");
    console.log("\n📝 询价信息:");
    console.log("客户:", mockInquiryData.company);
    console.log("联系人:", mockInquiryData.email);
    console.log("商品:", mockInquiryData.productName);
    console.log("描述:", mockInquiryData.productDesc);
    console.log("单价:", `$${mockInquiryData.sku.price}`);
    console.log("数量:", mockInquiryData.quantity, mockInquiryData.unit);
    console.log("付款方式:", mockInquiryData.paymentMethod);
    console.log("备注:", mockInquiryData.remarks);

    // 生成报价单数据
    const quotationData = createQuotationData(mockInquiryData, mockInquiryId);

    console.log("\n💰 计算结果:");
    console.log("总金额:", `$${quotationData.termsUSD}`);

    // 生成Excel
    console.log("\n📊 正在生成Excel文件...");
    const excelBuffer = await generateQuotationExcel(quotationData);

    // 保存文件
    const outputDir = path.join(__dirname, "services/__tests__");
    const outputFile = path.join(
      outputDir,
      `real_inquiry_${mockInquiryData.company.replace(/\s+/g, "_")}_${Date.now()}.xlsx`
    );

    fs.writeFileSync(outputFile, excelBuffer);

    console.log("✅ 报价单Excel已生成:");
    console.log("   文件路径:", outputFile);
    console.log("   文件大小:", (excelBuffer.length / 1024).toFixed(2), "KB");

    // 模拟邮件附件名称
    const inquiryNumber = `INQ${mockInquiryId.toString().padStart(6, "0")}`;
    const attachmentName = `询价单-${inquiryNumber}.xlsx`;
    console.log("\n📧 邮件附件名称:", attachmentName);

    console.log("\n✅ 测试完成！请打开Excel文件查看商品信息是否正确填充。");
  } catch (error) {
    console.error("❌ 测试失败:", error);
  }
}

// 运行测试
testRealInquiryScenario();
