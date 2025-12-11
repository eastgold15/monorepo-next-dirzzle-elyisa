export interface Category {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  isStreaming?: boolean;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle?: string;
  price: number;
  category: string;
  image: string;
  additionalImages?: string[];
  isNew?: boolean;
  description?: string;
  factoryInfo?: string;
  colors?: ProductColor[];
  sizes?: string[];
}

export const FashionMode = {
  SHOES: "Shoes",
  BAGS: "Bags",
  COUTURE: "Couture",
} as const;
