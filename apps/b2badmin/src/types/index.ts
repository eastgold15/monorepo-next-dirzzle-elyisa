export type FieldType = 'text' | 'number' | 'select' | 'multiselect' | 'richtext';

export interface TemplateField {
  id: string;
  name: string;
  code: string;
  type: FieldType;
  isSkuSpec: boolean; // Determines if this field drives SKU generation
  options?: string[]; // For select/multiselect
  required?: boolean;
}

export interface ProductTemplate {
  id: string;
  name: string;
  description?: string;
  fields: TemplateField[];
  createdAt: string;
}

export interface MediaAsset {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
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
  status: 'draft' | 'pending_review' | 'published';
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'factory_admin' | 'sales';
  avatar: string;
}