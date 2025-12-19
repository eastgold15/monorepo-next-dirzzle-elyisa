/**
 * 修复Excel模板中的拼写错误
 * 将 tearms 改为 terms
 */

import fs from "node:fs/promises";
import ExcelJS from "exceljs";

const TEMPLATE_PATH =
  "D:\\Users\\boer\\Desktop\\gina\\apps\\web\\src\\server\\modules\\inquiry\\excelTemplate\\inquiry.xlsx";
const BACKUP_PATH =
  "D:\\Users\\boer\\Desktop\\gina\\apps\\web\\src\\server\\modules\\inquiry\\excelTemplate\\inquiry_backup.xlsx";

async function fixTemplateSpelling() {
  try {
    console.log("🔧 修复Excel模板中的拼写错误...\n");

    // 1. 先备份原文件
    console.log("📋 备份原模板...");
    const originalData = await fs.readFile(TEMPLATE_PATH);
    await fs.writeFile(BACKUP_PATH, originalData);
    console.log("✅ 备份完成:", BACKUP_PATH);

    // 2. 加载模板
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(TEMPLATE_PATH);
    const worksheet = workbook.worksheets[0];

    console.log("\n🔍 查找并修复拼写错误...");

    let replacements = 0;

    // 3. 遍历所有单元格，查找并替换占位符
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        if (typeof cell.value === "string") {
          // 替换所有 tearms 为 terms
          const originalValue = cell.value;
          const newValue = cell.value
            .replace(/{{tearmsCode/g, "{{termsCode")
            .replace(/{{tearmsDesc/g, "{{termsDesc")
            .replace(/{{tearmsUnits/g, "{{termsUnits")
            .replace(/{{tearmsUsd/g, "{{termsUsd")
            .replace(/{{tearmsRemark/g, "{{termsRemark")
            .replace(/{{tearmsTTL/g, "{{termsTTL")
            .replace(/{{tearmsUSD/g, "{{termsUSD")
            .replace(/{{TearmsUnits/g, "{{termsUnits"); // 第16行有个大写的

          if (originalValue !== newValue) {
            cell.value = newValue;
            const colLetter = String.fromCharCode(64 + colNumber);
            console.log(
              `  修复 ${colLetter}${rowNumber}: "${originalValue}" -> "${newValue}"`
            );
            replacements++;
          }
        }
      });
    });

    if (replacements > 0) {
      console.log(`\n✅ 共修复了 ${replacements} 个拼写错误`);

      // 4. 保存修复后的模板
      await workbook.xlsx.writeFile(TEMPLATE_PATH);
      console.log("✅ 模板已更新");

      // 5. 验证修复结果
      console.log("\n🔍 验证修复结果...");
      const verifyWorkbook = new ExcelJS.Workbook();
      await verifyWorkbook.xlsx.readFile(TEMPLATE_PATH);
      const verifyWorksheet = verifyWorkbook.worksheets[0];

      console.log("\nA13 - J17 区域修复后的占位符:");
      for (let row = 13; row <= 17; row++) {
        for (let col = 1; col <= 10; col++) {
          const cell = verifyWorksheet.getCell(row, col);
          const colLetter = String.fromCharCode(64 + col);

          if (typeof cell.value === "string" && cell.value.includes("{{")) {
            console.log(`  ${colLetter}${row}: ${cell.value}`);
          }
        }
      }
    } else {
      console.log("\n✅ 没有发现需要修复的拼写错误");
    }
  } catch (error) {
    console.error("❌ 修复失败:", error);
  }
}

// 运行修复
fixTemplateSpelling();
// 运行修复
fixTemplateSpelling();
