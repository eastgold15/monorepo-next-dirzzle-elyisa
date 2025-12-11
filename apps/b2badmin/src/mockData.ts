import type {
  Category,
  Factory,
  MediaAsset,
  Product,
  ProductTemplate,
} from "./types";

export const INITIAL_MEDIA: MediaAsset[] = [
  {
    id: "m1",
    url: "https://picsum.photos/400/400?random=1",
    name: "Running Shoe Red Side",
    type: "image",
    tags: ["shoe", "red", "side"],
  },
  {
    id: "m2",
    url: "https://picsum.photos/400/400?random=2",
    name: "Running Shoe Blue Top",
    type: "image",
    tags: ["shoe", "blue", "top"],
  },
  {
    id: "m3",
    url: "https://picsum.photos/400/400?random=3",
    name: "Leather Boot Brown",
    type: "image",
    tags: ["boot", "leather"],
  },
  {
    id: "m4",
    url: "https://picsum.photos/400/400?random=4",
    name: "Canvas Sneaker White",
    type: "image",
    tags: ["sneaker", "white"],
  },
];

export const INITIAL_TEMPLATES: ProductTemplate[] = [
  {
    id: "t1",
    name: "Standard Running Shoe",
    description: "Template for athletic footwear",
    createdAt: new Date().toISOString(),
    fields: [
      {
        id: "f1",
        name: "Brand",
        code: "brand",
        type: "text",
        isSkuSpec: false,
        required: true,
      },
      {
        id: "f2",
        name: "Material",
        code: "material",
        type: "select",
        isSkuSpec: true,
        options: ["Mesh", "Knit", "Synthetic"],
        required: true,
      },
      {
        id: "f3",
        name: "Color",
        code: "color",
        type: "multiselect",
        isSkuSpec: true,
        options: ["Red", "Blue", "Black", "White", "Neon"],
        required: true,
      },
      {
        id: "f4",
        name: "Size",
        code: "size",
        type: "multiselect",
        isSkuSpec: true,
        options: ["38", "39", "40", "41", "42", "43", "44"],
        required: true,
      },
      {
        id: "f5",
        name: "Description",
        code: "description",
        type: "richtext",
        isSkuSpec: false,
        required: false,
      },
    ],
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "c1",
    name: "Running Shoes",
    slug: "running-shoes",
    description: "Performance footwear for running",
  },
  {
    id: "c2",
    name: "Casual Sneakers",
    slug: "casual-sneakers",
    description: "Everyday street wear",
  },
  {
    id: "c3",
    name: "Formal Boots",
    slug: "formal-boots",
    description: "Leather boots for formal occasions",
  },
];

export const INITIAL_FACTORIES: Factory[] = [
  {
    id: "fac1",
    name: "ShoeMaster Mfg (Guangdong)",
    location: "Guangdong, CN",
    contactPerson: "Mr. Zhang",
  },
  {
    id: "fac2",
    name: "Vietnam BestStep Co.",
    location: "Ho Chi Minh, VN",
    contactPerson: "Ms. Nguyen",
  },
  {
    id: "fac3",
    name: "Italiano Artisans",
    location: "Florence, IT",
    contactPerson: "Mario Rossi",
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "SpeedDemon 2025",
    templateId: "t1",
    categoryId: "c1",
    factoryId: "fac1",
    status: "published",
    createdAt: new Date().toISOString(),
    baseData: {
      brand: "Velocity",
      description: "High performance running shoe.",
    },
    skus: [
      {
        id: "s1",
        skuCode: "SD25-RED-40",
        specs: { color: "Red", size: "40", material: "Mesh" },
        price: 120,
        stock: 50,
      },
      {
        id: "s2",
        skuCode: "SD25-RED-41",
        specs: { color: "Red", size: "41", material: "Mesh" },
        price: 120,
        stock: 45,
      },
    ],
  },
];
