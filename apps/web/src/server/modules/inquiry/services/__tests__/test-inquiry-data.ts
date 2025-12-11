/**
 * 生成测试询价数据的脚本
 * 用于测试Excel中的商品填充功能
 */

import fs from "node:fs";
import path from "node:path";
import type { QuotationData } from "../../excelTemplate/QuotationData";
import { generateQuotationExcel } from "../excel.service";

// 测试用的虚假商品数据
const testQuotationData: QuotationData = {
  // 出口商信息
  exporterName: "DONG QI FOOTWEAR INTL MFG CO., LTD",
  exporterAddr:
    "No.2 Chiling Road, Chiling Industrial Zone, Houjie, Dongguan, Guangdong, China",
  exporterWeb: "www.dongqishoes.com",
  exporterEmail: "sales@dongqifootwear.com",
  exporterPhone: 8_676_928_791_234,

  // 工厂信息
  factoryName: "DONG QI FOOTWEAR (JIANGXI) CO., LTD",
  factoryAddr1: "Qifu Road, Shangou Industrial Park, Yudu, Ganzhou, Jiangxi",
  factoryAddr2:
    "No.3 Industrial Road, Shangrao Industrial Zone, Shangrao, Jiangxi",
  factoryWeb: "www.dongqishoes.com",
  factoryEmail: "sales@dongqishoes.com",
  factoryPhone: 8_676_928_795_678,

  // 客户信息
  clientCompanyName: "ABC Trading Company",
  clientFullName: "John Smith",
  clientWhatsApp: "+1234567890",
  clientEmail: "john.smith@abctrading.com",
  clientPhone: 1_234_567_890,
  photoForRefer: null,

  // 商品信息 - 填充3行商品
  termsCode1: 10_001,
  termsDesc1:
    "Men's Sports Shoes - Model S001 - High quality running shoes with breathable mesh upper and EVA sole",
  termsUnits1: "prs",
  termsUsd1: "25.50",
  termsRemark1: "MOQ: 500 pairs, Color: Black/White/Blue",

  termsCode2: 10_002,
  termsDesc2:
    "Women's Fashion Sneakers - Model W002 - Canvas sneakers with rubber sole and trendy design",
  termsUnits2: "prs",
  termsUsd2: 18.75,
  termsRemark2: "MOQ: 800 pairs, Available in 5 colors",

  termsCode3: 10_003,
  termsDesc3:
    "Kids' Casual Shoes - Model K003 - Lightweight casual shoes for children, non-slip sole",
  termsUnits3: "prs",
  termsUsd3: 12.3,
  termsRemark3: "MOQ: 1000 pairs, Sizes: 26-35",

  // 总金额
  termsTTL: 28_275, // (500*25.50) + (800*18.75) + (1000*12.30)
  termsUSD: 28_275,

  // 银行信息
  bankBeneficiary: "DONG QI FOOTWEAR INTL MFG CO., LTD",
  bankAccountNo: 1_234_567_890_123_456,
  bankName: "Bank of China, Dongguan Branch",
  bankAddr: "No. 1 Dongguan Avenue, Dongguan, Guangdong, China",

  // 签署信息
  exporterBehalf: "Michael Tse",
  date: new Date().toISOString().split("T")[0], // 格式: YYYY-MM-DD
};

async function generateTestExcel() {
  try {
    console.log("开始生成测试Excel文件...");
    console.log("商品数据:");
    console.log("1. 商品1:", testQuotationData.termsDesc1);
    console.log("2. 商品2:", testQuotationData.termsDesc2);
    console.log("3. 商品3:", testQuotationData.termsDesc3);
    console.log("总金额:", testQuotationData.termsUSD);

    // 生成Excel buffer
    const excelBuffer = await generateQuotationExcel(testQuotationData);

    // 保存到文件
    const outputDir = path.join(__dirname, "services/__tests__");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(
      outputDir,
      "test_quotation_with_products.xlsx"
    );
    fs.writeFileSync(outputFile, excelBuffer);

    console.log("✅ Excel文件已生成:", outputFile);
    console.log("文件大小:", excelBuffer.length, "bytes");

    // 验证数据是否正确
    console.log("\n验证填充的数据:");
    console.log("客户公司:", testQuotationData.clientCompanyName);
    console.log("客户姓名:", testQuotationData.clientFullName);
    console.log("商品1描述:", testQuotationData.termsDesc1);
    console.log("商品1价格:", testQuotationData.termsUsd1);
    console.log("商品2描述:", testQuotationData.termsDesc2);
    console.log("商品2价格:", testQuotationData.termsUsd2);
    console.log("商品3描述:", testQuotationData.termsDesc3);
    console.log("商品3价格:", testQuotationData.termsUsd3);
  } catch (error) {
    console.error("❌ 生成Excel失败:", error);
  }
}

// 运行测试
generateTestExcel();
