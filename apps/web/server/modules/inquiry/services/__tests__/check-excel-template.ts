/**
 * 检查Excel模板中A13到J17区域的数据格式
 */

import fs from "node:fs";
import ExcelJS from "exceljs";
import {
  type QuotationData,
  quotationDefaultData,
} from "../../excelTemplate/QuotationData";
import { generateQuotationExcel } from "../excel.service";

// 模板路径
const TEMPLATE_PATH =
  "D:\\Users\\boer\\Desktop\\gina\\apps\\web\\src\\server\\modules\\inquiry\\excelTemplate\\inquiry.xlsx";

async function checkTemplateCells() {
  try {
    console.log("📊 检查Excel模板中的单元格数据格式...\n");

    // 加载模板
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(TEMPLATE_PATH);
    const worksheet = workbook.worksheets[0];

    // 检查 A13 到 J17 的单元格
    console.log("📍 检查 A13 - J17 区域的数据格式:");
    console.log("=".repeat(80));

    for (let row = 13; row <= 17; row++) {
      console.log(`\n第 ${row} 行:`);
      for (let col = 1; col <= 10; col++) {
        // A=1, J=10
        const cell = worksheet.getCell(row, col);
        const colLetter = String.fromCharCode(64 + col); // 1=A, 2=B, ...

        let cellInfo = `  ${colLetter}${row}: `;

        if (cell.value) {
          if (typeof cell.value === "object" && "text" in cell.value) {
            // 超链接
            cellInfo += `超链接 - 文本: "${cell.value.text}"`;
            if (cell.value.hyperlink) {
              cellInfo += `, 链接: "${cell.value.hyperlink}"`;
            }
          } else {
            // 普通文本或数字
            cellInfo += `"${cell.value}" (${typeof cell.value})`;
          }
        } else {
          cellInfo += "空";
        }

        // 检查占位符
        if (typeof cell.value === "string" && cell.value.includes("{{")) {
          cellInfo += " ✨ 包含占位符";
        }

        console.log(cellInfo);
      }
    }

    console.log(`\n${"=".repeat(80)}`);
    console.log("\n🔍 测试数据填充:");

    // 创建测试数据
    const testData: QuotationData = {
      ...quotationDefaultData,
      // 填充第一行商品数据
      termsCode1: 10_001,
      termsDesc1: "测试商品描述 - 这是一个测试商品",
      termsUnits1: "pcs",
      termsUsd1: "99.99",
      termsRemark1: "测试备注信息",
      termsTTL: 9999,
      termsUSD: 9999,
    };

    // 生成Excel
    const buffer = await generateQuotationExcel(testData);

    // 加载生成的Excel检查
    const testWorkbook = new ExcelJS.Workbook();
    await testWorkbook.xlsx.load(buffer);
    const testWorksheet = testWorkbook.worksheets[0];

    console.log("\n填充后的 A13 - J17 区域:");
    for (let row = 13; row <= 17; row++) {
      console.log(`\n第 ${row} 行:`);
      for (let col = 1; col <= 10; col++) {
        const cell = testWorksheet.getCell(row, col);
        const colLetter = String.fromCharCode(64 + col);

        let cellInfo = `  ${colLetter}${row}: `;

        if (cell.value) {
          if (typeof cell.value === "object" && "text" in cell.value) {
            cellInfo += `"${cell.value.text}"`;
          } else {
            cellInfo += `"${cell.value}"`;
          }
        } else {
          cellInfo += "空";
        }

        console.log(cellInfo);
      }
    }

    // 保存测试文件
    fs.writeFileSync(
      "D:\\Users\\boer\\Desktop\\gina\\apps\\web\\src\\server\\modules\\inquiry\\services\\__tests__\\debug_output.xlsx",
      buffer
    );
    console.log("\n✅ 测试文件已保存: debug_output.xlsx");
  } catch (error) {
    console.error("❌ 检查失败:", error);
  }
}

// 运行检查
checkTemplateCells();
