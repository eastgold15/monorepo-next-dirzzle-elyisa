/**
 * 询价模块扩展类型定义
 * 包含业务逻辑中需要的额外类型
 */

// 询价商品项类型（简化版）
export interface InquiryItem {
  id: string;
  inquiryid: string;
  productid: string;
  productName: string;
  productDescription?: string;
  productImage?: string;
  productPrice?: string;
  quantity: number;
  customerRequirements?: string;
}

// 邮件发送结果
export interface InquiryEmailResult {
  customerEmailSent: boolean;
  salesEmailSent: boolean;
  inquiryNumber: string;
  merchantInfo: {
    id: string;
    name: string;
    code: string;
  };
  salesRepsCount: number;
  primarySalesRep?: {
    name: string;
    email: string;
  };
}
