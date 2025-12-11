import { test } from "vitest";
import { createCustomerInquiryTemplate } from "@/server/modules/inquiry/services/inquiry.templates";

test("renders learn react link", () => {
  createCustomerInquiryTemplate();
});
