/**
 * Excel 服务测试
 */

import { beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ExcelJS from "exceljs";
import { quotationDefaultData } from "../../excelTemplate/QuotationData";
import { generateQuotationExcel, TEMPLATE_PATH } from "../excel.service";

describe("Excel Service", () => {
  describe("generateQuotationExcel", () => {
    console.log("TEMPLATE_PATH:", TEMPLATE_PATH);
    it("应该成功生成 Excel 文件", async () => {
      if (!fs.existsSync(TEMPLATE_PATH)) {
        throw new Error(`Excel模板文件不存在: ${TEMPLATE_PATH}`);
      }

      // 加载模板
      const workbook = new ExcelJS.Workbook();
      const res = await workbook.xlsx.readFile(TEMPLATE_PATH);
      // console.log('res:', res)
      const worksheet = workbook.worksheets[0];
      console.log("worksheet:", worksheet);

      // 确保worksheet存在
      if (!worksheet) {
        throw new Error("无法从Excel模板加载工作表");
      }

      const result = await generateQuotationExcel(quotationDefaultData);
      console.log("result:", result);

      expect(result).toBeInstanceOf(Buffer);
    });
  });
});

const __filename = fileURLToPath(import.meta.url);

// 临时输出目录（测试用）
const OUTPUT_DIR = path.resolve(__filename, "../", "__output__");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "generated_quotation.xlsx");

describe("Excel Service", () => {
  beforeEach(() => {
    // 确保输出目录存在
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
  });

  describe("generateQuotationExcel", () => {
    it("应该成功生成 Excel 文件并保存到磁盘供检查", async () => {
      // 1. 调用服务生成 Buffer
      const buffer = await generateQuotationExcel(quotationDefaultData);

      // 2. 验证类型
      expect(buffer).toBeInstanceOf(Buffer);

      // 3. ✅ 保存到文件（关键步骤！）
      await Bun.write(OUTPUT_FILE, buffer); // Bun 特有高效写法
      // 或者用 Node 兼容方式：
      // fs.writeFileSync(OUTPUT_FILE, buffer);

      console.log(`✅ Excel 已保存到: ${OUTPUT_FILE}`);

      // 4. 可选：再读取验证是否合法
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(OUTPUT_FILE);
      expect(workbook.worksheets).toHaveLength(1);
      console.log("✅ 生成的 Excel 可被 ExcelJS 正常解析");
    });
  });
});
