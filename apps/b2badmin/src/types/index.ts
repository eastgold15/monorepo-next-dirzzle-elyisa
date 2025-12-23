import type { AttributeDTO } from "@repo/contract";

export type FieldType =
  | "text"
  | "number"
  | "select"
  | "multiselect"
  | "richtext";

export interface ProductTemplate {
  id: string;
  name: string;
  description?: string;
  fields: TemplateField[];
  createdAt: string;
}

export type TemplateField = AttributeDTO["Entity"] & {
  value?: string; // text/number 类型的占位符或默认值
  options?: string[]; // select/multiselect 类型的选项数组
};

export interface MediaAsset {
  id: string;
  url: string;
  name: string;
  type: "image" | "video";
  tags: string[];
}

export interface SkuVariant {
  id: string;
  skuCode: string;
  specs: Record<string, string>; // e.g. { color: 'Red', size: '42' }
  price: number;
  stock: number;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Factory {
  id: string;
  name: string;
  location: string;
  contactPerson: string;
}

export interface Product {
  id: string;
  name: string;
  templateId: string;
  categoryId: string;
  factoryId: string;
  baseData: Record<string, any>; // Non-SKU fields
  skus: SkuVariant[];
  status: "draft" | "pending_review" | "published";
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  role: "admin" | "factory_admin" | "sales";
  avatar: string;
}
