/**
 * 测试环境配置
 */

// 导出测试工具函数
export const createMockInquiryData = () => ({
  id: 1,
  customerName: "Test Customer",
  companyName: "Test Company",
  email: "test@example.com",
  phone: "1234567890",
  whatsapp: "1234567890",
  status: "pending" as const,
  createdAt: new Date(),
  notes: "Test notes",
  items: [
    {
      id: 1,
      inquiryId: 1,
      productId: 1,
      productName: "Test Product",
      productDescription: "Test Description",
      productImage: "http://example.com/image.jpg",
      productPrice: "100.00",
      quantity: 10,
      customerRequirements: "Test requirements",
    },
  ],
});
