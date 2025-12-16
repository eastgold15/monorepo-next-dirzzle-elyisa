import { relations } from "@repo/contract";
import {
  // Auth相关
  accountTable,
  attributeTable,
  attributeTemplateTable,
  attributeValueTable,
  // 其他
  CustomerTable,
  dailyInquiryCounterTable,
  // 业务数据
  exportersTable,
  factoriesTable,
  heroCardsTable,
  // 基础数据
  MasterTable,
  permissionTable,
  productsTable,
  productTemplateTable,
  rolePermissionsTable,
  roleTable,
  siteCategoriesTable,
  siteConfigTable,
  siteProductsTable,
  sitesTable,
  skusTable,
  translationDictTable,
  userSiteRolesTable,
  usersTable,
} from "@repo/contract/table";
import { randomUUIDv7 } from "bun";
import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle(
  "postgres://gina_user:gina_password@localhost:5432/gina_dev",
  { relations }
);

// 预定义密码哈希 (12345678)

// 角色权限映射（内联定义，避免导入问题）
const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: [
    "view_users",
    "create_users",
    "edit_users",
    "delete_users",
    "view_factories",
    "create_factories",
    "edit_factories",
    "delete_factories",
    "view_products",
    "create_products",
    "edit_products",
    "delete_products",
    "publish_products",
    "view_media",
    "upload_media",
    "delete_media",
    "view_orders",
    "process_orders",
    "view_analytics",
    "export_reports",
    "view_site_config",
    "edit_site_config",
    "view_categories",
    "edit_categories",
    "assign_categories",
    "manage_sites",
    "view_inquiries",
    "process_inquiries",
  ],
  exporter_admin: [
    "view_users",
    "create_users",
    "edit_users",
    "delete_users",
    "view_factories",
    "create_factories",
    "edit_factories",
    "delete_factories",
    "view_products",
    "create_products",
    "edit_products",
    "delete_products",
    "publish_products",
    "view_media",
    "upload_media",
    "delete_media",
    "view_orders",
    "process_orders",
    "view_analytics",
    "export_reports",
    "view_site_config",
    "edit_site_config",
    "view_categories",
    "edit_categories",
    "assign_categories",
    "view_inquiries",
    "process_inquiries",
  ],
  factory_admin: [
    "view_users",
    "create_users",
    "edit_users",
    "view_factories",
    "edit_factories",
    "view_products",
    "create_products",
    "edit_products",
    "delete_products",
    "publish_products",
    "view_media",
    "upload_media",
    "delete_media",
    "view_orders",
    "process_orders",
    "view_analytics",
    "view_categories",
    "assign_categories",
    "view_inquiries",
  ],
  salesperson: [
    "view_products",
    "create_products",
    "edit_products",
    "view_media",
    "upload_media",
    "delete_media",
    "view_orders",
    "view_inquiries",
  ],
};

// 预定义密码哈希 (12345678)
const hashedPassword =
  "948ca608bf8799e01f412bc8e42e4384:18a873f36c8ccb79a0954f6ae5c66ecc0a1c14f113e6d3f0e65dd3d0deeb3257cdc3fa840021fe627cf6f399cb8beb9c597ed30967a8959badb5e782db934065";

// 1. 角色数据
const roles = [
  {
    id: randomUUIDv7(),
    name: "exporter_admin",
    description: "出口商管理员",
    type: "system",
    priority: 80,
  },
  {
    id: randomUUIDv7(),
    name: "factory_admin",
    description: "工厂管理员",
    type: "system",
    priority: 70,
  },
  {
    id: randomUUIDv7(),
    name: "salesperson",
    description: "业务员",
    type: "system",
    priority: 50,
  },
  {
    id: randomUUIDv7(),
    name: "super_admin",
    description: "超级管理员",
    type: "system",
    priority: 100,
  },
];

// 2. 权限数据（基于permissions.t.model.ts中定义的权限）
const permissions = [
  // 用户管理
  { id: randomUUIDv7(), name: "view_users", description: "查看用户" },
  { id: randomUUIDv7(), name: "create_users", description: "创建用户" },
  { id: randomUUIDv7(), name: "edit_users", description: "编辑用户" },
  { id: randomUUIDv7(), name: "delete_users", description: "删除用户" },

  // 工厂管理
  { id: randomUUIDv7(), name: "view_factories", description: "查看工厂" },
  { id: randomUUIDv7(), name: "create_factories", description: "创建工厂" },
  { id: randomUUIDv7(), name: "edit_factories", description: "编辑工厂" },
  { id: randomUUIDv7(), name: "delete_factories", description: "删除工厂" },

  // 商品管理
  { id: randomUUIDv7(), name: "view_products", description: "查看商品" },
  { id: randomUUIDv7(), name: "create_products", description: "创建商品" },
  { id: randomUUIDv7(), name: "edit_products", description: "编辑商品" },
  { id: randomUUIDv7(), name: "delete_products", description: "删除商品" },
  { id: randomUUIDv7(), name: "publish_products", description: "发布商品" },

  // 媒体管理
  { id: randomUUIDv7(), name: "view_media", description: "查看媒体" },
  { id: randomUUIDv7(), name: "upload_media", description: "上传媒体" },
  { id: randomUUIDv7(), name: "delete_media", description: "删除媒体" },

  // 订单管理
  { id: randomUUIDv7(), name: "view_orders", description: "查看订单" },
  { id: randomUUIDv7(), name: "process_orders", description: "处理订单" },

  // 统计报表
  { id: randomUUIDv7(), name: "view_analytics", description: "查看分析" },
  { id: randomUUIDv7(), name: "export_reports", description: "导出报表" },

  // 系统配置
  { id: randomUUIDv7(), name: "view_site_config", description: "查看站点配置" },
  { id: randomUUIDv7(), name: "edit_site_config", description: "编辑站点配置" },

  // 分类管理
  { id: randomUUIDv7(), name: "view_categories", description: "查看分类" },
  { id: randomUUIDv7(), name: "edit_categories", description: "编辑分类" },
  { id: randomUUIDv7(), name: "assign_categories", description: "分配分类" },

  // 站点管理
  { id: randomUUIDv7(), name: "manage_sites", description: "管理站点" },

  // 询盘管理
  { id: randomUUIDv7(), name: "view_inquiries", description: "查看询盘" },
  { id: randomUUIDv7(), name: "process_inquiries", description: "处理询盘" },
];

// 3. 产品分类数据 - 添加更多鞋类相关分类
const categories = [
  // 鞋类主分类
  {
    id: "019b1bd7-8d03-701c-85c9-4cb7bbc75ab5",
    name: "pumps",
    slug: "pumps",
    description: "pumps",
    parentId: null,
    sortOrder: 1,
    isVisible: true,
    icon: "electronics",
  },
  {
    id: "095138c7-5eef-476c-ac66-38f86d4697bb",
    name: "bridal",
    slug: "bridal",
    description: "bridal",
    parentId: null,
    sortOrder: 6,
    isVisible: true,
    icon: "clothing",
  },
  {
    id: "019b1bd7-8d03-701e-8722-e6956b408ff7",
    name: "boots",
    slug: "boots",
    description: "boots",
    parentId: null,
    sortOrder: 3,
    isVisible: true,
    icon: "home",
  },
  {
    id: "019b1bd7-8d03-701d-bdc5-fdd947ca7202",
    name: "sandals",
    slug: "sandals",
    description: "sandals",
    parentId: null,
    sortOrder: 2,
    isVisible: true,
    icon: "clothing",
  },
  {
    id: "019b1bd7-8d03-701f-ac04-80e22fe95368",
    name: "platforms",
    slug: "platforms",
    description: "platforms",
    parentId: null,
    sortOrder: 4,
    isVisible: true,
    icon: "sports",
  },
  {
    id: "019b1bd7-8d03-7020-b2a7-38f19eeb860f",
    name: "flats",
    slug: "flats",
    description: "flats",
    parentId: null,
    sortOrder: 5,
    isVisible: true,
    icon: "food",
  },
  // 其他分类
  {
    id: randomUUIDv7(),
    name: "bags",
    slug: "bags",
    description: "bags",
    parentId: null,
    sortOrder: 7,
    isVisible: true,
    icon: "bags",
  },
  {
    id: randomUUIDv7(),
    name: "about us",
    slug: "about-us",
    description: "about us",
    parentId: null,
    sortOrder: 8,
    isVisible: true,
    icon: "about",
  },
];

// 4. 出口商数据
const exporterData = [
  {
    id: randomUUIDv7(),
    name: "环球贸易公司",
    code: "GLOBAL_TRADE",
    address: "深圳市福田区",
    contact: "13800138006",
  },
  {
    id: randomUUIDv7(),
    name: "美亚进出口",
    code: "MEYA_IMPORT",
    address: "广州市天河区",
    contact: "13800138007",
  },
];

// 5. 工厂数据
const factoryData = [
  {
    id: randomUUIDv7(),
    name: "东莞电子制造厂",
    code: "DG_ELECTRONICS",
    website: "https://www.dg-electronics.com",
    address: "东莞市东城区科技园",
    categoryId: "", // 稍后设置
    contactPhone: "13800138001",
    isActive: true,
    isVerified: false,
    mainProducts: "电子元件、电路板、智能设备",
    annualRevenue: "5000万-1亿",
    employeeCount: 200,
  },
  {
    id: randomUUIDv7(),
    name: "深圳科技园",
    code: "SZ_TECH",
    website: "https://www.sz-tech.com",
    address: "深圳市南山区高新技术产业园",
    categoryId: "", // 稍后设置
    contactPhone: "13800138002",
    isActive: true,
    isVerified: true,
    mainProducts: "软件开发、系统集成、技术咨询",
    annualRevenue: "1亿-5亿",
    employeeCount: 500,
  },
  {
    id: randomUUIDv7(),
    name: "广州服装厂",
    code: "GZ_CLOTHING",
    website: "https://www.gz-clothing.com",
    address: "广州市番禺区服装产业园",
    categoryId: "", // 稍后设置
    contactPhone: "13800138003",
    isActive: true,
    isVerified: true,
    mainProducts: "休闲服装、运动服、童装",
    annualRevenue: "3000万-5000万",
    employeeCount: 300,
  },
];

// 6. 用户数据
const users = [
  {
    id: randomUUIDv7(),
    name: "超级管理员",
    email: "super@admin.com",
    emailVerified: true,
    isSuperAdmin: true,
    image:
      "https://ui-avatars.com/api/?name=超级管理员&background=random&color=fff",
  },
  {
    id: randomUUIDv7(),
    name: "张三",
    email: "admin@exporter.com",
    emailVerified: true,
    image: "https://ui-avatars.com/api/?name=张三&background=random&color=fff",
  },
  {
    id: randomUUIDv7(),
    name: "李四",
    email: "factory@manager.com",
    emailVerified: true,
    image: "https://ui-avatars.com/api/?name=李四&background=random&color=fff",
  },
  {
    id: randomUUIDv7(),
    name: "王五",
    email: "sales@rep.com",
    emailVerified: true,
    image: "https://ui-avatars.com/api/?name=王五&background=random&color=fff",
  },
  {
    id: randomUUIDv7(),
    name: "赵六",
    email: "john@example.com",
    emailVerified: true,
    image: "https://ui-avatars.com/api/?name=John&background=random&color=fff",
  },
  {
    id: randomUUIDv7(),
    name: "陈七",
    email: "jane@example.com",
    emailVerified: true,
    image: "https://ui-avatars.com/api/?name=Jane&background=random&color=fff",
  },
];

// 7. 属性模板数据
const attributeTemplates = [
  {
    id: randomUUIDv7(),
    name: "电子产品属性模板",
    categoryId: "", // 稍后设置
  },
  {
    id: randomUUIDv7(),
    name: "服装属性模板",
    categoryId: "", // 稍后设置
  },
  {
    id: randomUUIDv7(),
    name: "家居用品属性模板",
    categoryId: "", // 稍后设置
  },
];

// 8. 属性定义数据
const attributes = [
  // 电子产品属性
  {
    id: randomUUIDv7(),
    templateId: "", // 稍后设置
    name: "颜色",
    code: "color",
    inputType: "select",
    isRequired: true,
    isSaleAttr: true,
    sortOrder: 1,
  },
  {
    id: randomUUIDv7(),
    templateId: "", // 稍后设置
    name: "存储容量",
    code: "storage",
    inputType: "select",
    isRequired: true,
    isSaleAttr: true,
    sortOrder: 2,
  },
  // 服装属性
  {
    id: randomUUIDv7(),
    templateId: "", // 稍后设置
    name: "尺码",
    code: "size",
    inputType: "select",
    isRequired: true,
    isSaleAttr: true,
    sortOrder: 1,
  },
  {
    id: randomUUIDv7(),
    templateId: "", // 稍后设置
    name: "材质",
    code: "material",
    inputType: "select",
    isRequired: false,
    isSaleAttr: false,
    sortOrder: 2,
  },
];

// 9. 属性值数据
const attributeValues = [
  // 颜色值
  {
    id: randomUUIDv7(),
    attributeId: "",
    value: "黑色",
    valueCode: "black",
    sortOrder: 1,
  },
  {
    id: randomUUIDv7(),
    attributeId: "",
    value: "白色",
    valueCode: "white",
    sortOrder: 2,
  },
  {
    id: randomUUIDv7(),
    attributeId: "",
    value: "红色",
    valueCode: "red",
    sortOrder: 3,
  },
  {
    id: randomUUIDv7(),
    attributeId: "",
    value: "蓝色",
    valueCode: "blue",
    sortOrder: 4,
  },
  // 存储容量值
  {
    id: randomUUIDv7(),
    attributeId: "",
    value: "64GB",
    valueCode: "64gb",
    sortOrder: 1,
  },
  {
    id: randomUUIDv7(),
    attributeId: "",
    value: "128GB",
    valueCode: "128gb",
    sortOrder: 2,
  },
  {
    id: randomUUIDv7(),
    attributeId: "",
    value: "256GB",
    valueCode: "256gb",
    sortOrder: 3,
  },
  {
    id: randomUUIDv7(),
    attributeId: "",
    value: "512GB",
    valueCode: "512gb",
    sortOrder: 4,
  },
  // 尺码值
  {
    id: randomUUIDv7(),
    attributeId: "",
    value: "S",
    valueCode: "s",
    sortOrder: 1,
  },
  {
    id: randomUUIDv7(),
    attributeId: "",
    value: "M",
    valueCode: "m",
    sortOrder: 2,
  },
  {
    id: randomUUIDv7(),
    attributeId: "",
    value: "L",
    valueCode: "l",
    sortOrder: 3,
  },
  {
    id: randomUUIDv7(),
    attributeId: "",
    value: "XL",
    valueCode: "xl",
    sortOrder: 4,
  },
  {
    id: randomUUIDv7(),
    attributeId: "",
    value: "XXL",
    valueCode: "xxl",
    sortOrder: 5,
  },
  // 材质值
  {
    id: randomUUIDv7(),
    attributeId: "",
    value: "纯棉",
    valueCode: "cotton",
    sortOrder: 1,
  },
  {
    id: randomUUIDv7(),
    attributeId: "",
    value: "涤纶",
    valueCode: "polyester",
    sortOrder: 2,
  },
  {
    id: randomUUIDv7(),
    attributeId: "",
    value: "混纺",
    valueCode: "blended",
    sortOrder: 3,
  },
];

// 10. 示例商品数据
const products = [
  {
    id: randomUUIDv7(),
    spuCode: "SPU001",
    name: "智能手机",
    description: "高性能智能手机，支持5G网络",
    status: 1,
    factoryId: "", // 稍后设置
    units: "PCS",
  },
  {
    id: randomUUIDv7(),
    spuCode: "SPU002",
    name: "运动T恤",
    description: "透气舒适的运动T恤",
    status: 1,
    factoryId: "", // 稍后设置
    units: "PCS",
  },
];

// 11. SKU数据
const skus = [
  {
    id: randomUUIDv7(),
    productId: "", // 稍后设置
    skuCode: "SKU001-001",
    name: "智能手机 黑色 64GB",
    price: 2999.0,
    stock: 100,
    specJson: { color: "黑色", storage: "64GB" }, // spec_json字段需要JSON对象
  },
  {
    id: randomUUIDv7(),
    productId: "", // 稍后设置
    skuCode: "SKU001-002",
    name: "智能手机 黑色 128GB",
    price: 3499.0,
    stock: 50,
    specJson: { color: "黑色", storage: "128GB" },
  },
  {
    id: randomUUIDv7(),
    productId: "", // 稍后设置
    skuCode: "SKU002-001",
    name: "运动T恤 S 纯棉",
    price: 99.0,
    stock: 200,
    specJson: { size: "S", material: "纯棉" },
  },
];

// 12. 主页卡片数据 - 使用提供的数据
const heroCards = [
  {
    id: "e6d2b19c-81ec-4b4a-9f70-a0242ae92920",
    title: 'DISCOVER "HEY BABY" COLLECTION',
    description: "Crafted in the decadent leopard design calf hair",
    buttonText: "LETS SHOPPIN",
    buttonUrl: "",
    backgroundClass: "bg-blue-50",
    imageId: null, // 暂时设为 null，稍后可以添加实际的媒体文件
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "eeb815b1-ded9-4b66-9bfa-fac1502ee013",
    title: "EXPLORE SANDALES",
    description:
      "Handcrafted in exquisite detail,explore our selection of sandals",
    buttonText: "EXPLORE MORE",
    buttonUrl: "",
    backgroundClass: "bg-blue-50",
    imageId: null, // 暂时设为 null，稍后可以添加实际的媒体文件
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "23ddb3b0-f732-4d5b-af8a-12f724415dea",
    title: 'MEET "HEY BABY" COLLECTION',
    description: "A sleek mule designed for elegant occasions",
    buttonText: "DISCOVER MORE",
    buttonUrl: "",
    backgroundClass: "bg-blue-50",
    imageId: null, // 暂时设为 null，稍后可以添加实际的媒体文件
    sortOrder: 2,
    isActive: true,
  },
];

// 15. 站点数据
const sites = [
  {
    id: randomUUIDv7(),
    name: "环球贸易站点",
    domain: "global-trade.example.com",
    siteType: "exporter",
    exporterId: "", // 稍后设置
    isActive: true,
  },
  {
    id: randomUUIDv7(),
    name: "东莞电子制造厂站点",
    domain: "dg-electronics.example.com",
    siteType: "factory",
    factoryId: "", // 稍后设置
    isActive: true,
  },
  {
    id: randomUUIDv7(),
    name: "深圳科技园站点",
    domain: "sz-tech.example.com",
    siteType: "factory",
    factoryId: "", // 稍后设置
    isActive: true,
  },
];

// 16. 站点分类数据（每个站点的独立分类体系）
const siteCategories = [
  // 环球贸易站点的分类
  {
    id: randomUUIDv7(),
    siteId: "", // 稍后设置
    name: "电子产品",
    parentId: null,
    sortOrder: 1,
    masterCategoryId: "", // 稍后设置
  },
  {
    id: randomUUIDv7(),
    siteId: "", // 稍后设置
    name: "手机",
    parentId: "", // 稍后设置
    sortOrder: 1,
    masterCategoryId: "",
  },
  // 工厂站点的分类
  {
    id: randomUUIDv7(),
    siteId: "", // 稍后设置
    name: "主打产品",
    parentId: null,
    sortOrder: 1,
    masterCategoryId: "",
  },
];

// 17. 站点配置数据
const siteConfigs2 = [
  {
    id: randomUUIDv7(),
    key: "site_name",
    value: "环球贸易公司",
    description: "站点名称",
    category: "general",
    siteId: "", // 稍后设置
  },
  {
    id: randomUUIDv7(),
    key: "site_description",
    value: "专业的电子产品出口商",
    description: "站点描述",
    category: "general",
    siteId: "", // 稍后设置
  },
];

// 18. 翻译字典数据
const translationDict = [
  {
    id: randomUUIDv7(),
    key: "welcome_message",
    category: "general",
    description: "欢迎信息",
    translations: {
      en: "Welcome to our platform",
      zh: "欢迎来到我们的平台",
      es: "Bienvenido a nuestra plataforma",
    },
    isActive: true,
    sortOrder: 1,
  },
  {
    id: randomUUIDv7(),
    key: "contact_us",
    category: "contact",
    description: "联系我们",
    translations: {
      en: "Contact Us",
      zh: "联系我们",
      es: "Contáctanos",
    },
    isActive: true,
    sortOrder: 2,
  },
];

// 19. 每日询盘计数器数据
const dailyInquiryCounter = [
  {
    id: randomUUIDv7(),
    date: new Date().toISOString().split("T")[0], // 今天
    count: 0,
    lastResetAt: new Date(),
  },
];

// 20. 客户数据
const customers = [
  {
    id: randomUUIDv7(),
    companyName: "美国ABC公司",
    name: "John Smith",
    email: "info@abc-usa.com",
    whatsapp: "+12125551234",
    phone: "2125551234",
    address: "123 Broadway, New York, NY 10001, USA",
  },
  {
    id: randomUUIDv7(),
    companyName: "德国XYZ贸易",
    name: "Hans Mueller",
    email: "contact@xyz-germany.de",
    whatsapp: "+493012345678",
    phone: "3012345678",
    address: "Friedrichstrasse 123, 10117 Berlin, Germany",
  },
];

// 清理数据库的函数
async function clearDatabase() {
  console.log("🧹 清理现有数据...");

  // 按照外键依赖顺序删除数据
  const tables = [
    // 先删除有外键依赖的表
    userSiteRolesTable,
    siteProductsTable,
    siteCategoriesTable,

    // SKU和商品相关
    skusTable,
    productTemplateTable,
    productsTable,
    attributeValueTable,
    attributeTable,
    attributeTemplateTable,

    // 业务数据
    factoriesTable,
    exportersTable,

    // 站点和配置
    sitesTable,
    siteConfigTable,
    heroCardsTable,

    // 其他数据
    CustomerTable,
    dailyInquiryCounterTable,
    translationDictTable,

    // Auth相关
    rolePermissionsTable,
    accountTable,
    usersTable,
    roleTable,
    permissionTable,

    // 基础数据
    MasterTable,
  ];

  for (const table of tables) {
    try {
      await db.delete(table);
    } catch (error) {
      // 忽略表不存在的错误
    }
  }
}

async function seedCompleteDatabase() {
  try {
    console.log("🌱 开始完整数据库初始化...");

    // 先清理数据库
    await clearDatabase();

    // 1. 插入角色数据
    console.log("📋 插入角色数据...");
    await db.insert(roleTable).values(roles);

    // 2. 插入权限数据
    console.log("🔑 插入权限数据...");
    await db.insert(permissionTable).values(permissions);

    // 3. 插入角色权限关联
    console.log("🔗 插入角色权限关联...");
    const rolePermissionRelations = [];

    // 为每个角色分配对应的权限
    for (const [roleName, permissionNames] of Object.entries(
      ROLE_PERMISSIONS
    )) {
      const role = roles.find((r) => r.name === roleName);
      if (!role) continue;

      for (const permissionName of permissionNames) {
        const permission = permissions.find((p) => p.name === permissionName);
        if (!permission) continue;

        rolePermissionRelations.push({
          roleId: role.id,
          permissionId: permission.id,
        });
      }
    }

    await db.insert(rolePermissionsTable).values(rolePermissionRelations);

    // 4. 插入产品分类数据
    console.log("📦 插入产品分类数据...");
    await db.insert(MasterTable).values(categories);

    // 5. 设置属性模板的分类ID并插入
    console.log("📋 插入属性模板数据...");
    attributeTemplates[0].categoryId = categories[0].id; // 电子产品
    attributeTemplates[1].categoryId = categories[1].id; // 服装
    attributeTemplates[2].categoryId = categories[2].id; // 家居
    await db.insert(attributeTemplateTable).values(attributeTemplates);

    // 6. 设置属性并插入
    console.log("🏷️ 插入属性定义数据...");
    attributes[0].templateId = attributeTemplates[0].id; // 电子产品-颜色
    attributes[1].templateId = attributeTemplates[0].id; // 电子产品-存储容量
    attributes[2].templateId = attributeTemplates[1].id; // 服装-尺码
    attributes[3].templateId = attributeTemplates[1].id; // 服装-材质
    await db.insert(attributeTable).values(attributes);

    // 7. 设置属性值并插入
    console.log("💎 插入属性值数据...");
    // 颜色值
    attributeValues[0].attributeId = attributes[0].id;
    attributeValues[1].attributeId = attributes[0].id;
    attributeValues[2].attributeId = attributes[0].id;
    attributeValues[3].attributeId = attributes[0].id;
    // 存储容量值
    attributeValues[4].attributeId = attributes[1].id;
    attributeValues[5].attributeId = attributes[1].id;
    attributeValues[6].attributeId = attributes[1].id;
    attributeValues[7].attributeId = attributes[1].id;
    // 尺码值
    attributeValues[8].attributeId = attributes[2].id;
    attributeValues[9].attributeId = attributes[2].id;
    attributeValues[10].attributeId = attributes[2].id;
    attributeValues[11].attributeId = attributes[2].id;
    attributeValues[12].attributeId = attributes[2].id;
    // 材质值
    attributeValues[13].attributeId = attributes[3].id;
    attributeValues[14].attributeId = attributes[3].id;
    attributeValues[15].attributeId = attributes[3].id;
    await db.insert(attributeValueTable).values(attributeValues);

    // 8. 插入出口商数据
    console.log("🚢 插入出口商数据...");
    await db.insert(exportersTable).values(exporterData);

    // 9. 插入工厂数据（分配categoryId）
    console.log("🏭 插入工厂数据...");
    const factoryDataWithCategories = factoryData.map((factory, index) => ({
      ...factory,
      categoryId: categories[index % categories.length].id,
    }));
    await db.insert(factoriesTable).values(factoryDataWithCategories);

    // 10. 插入用户数据到users表
    console.log("👥 插入用户数据...");
    await db.insert(usersTable).values(users);

    // 11. 创建Better Auth账户记录
    console.log("🔐 创建Better Auth账户记录...");
    const accounts = users.map((user) => ({
      id: randomUUIDv7(),
      userId: user.id,
      type: "email" as const,
      providerId: "credential",
      accountId: user.email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await db.insert(accountTable).values(accounts);

    // 12. 插入站点数据
    console.log("🌐 插入站点数据...");
    sites[0].exporterId = exporterData[0].id; // 环球贸易站点
    sites[1].factoryId = factoryDataWithCategories[0].id; // 东莞电子制造厂站点
    sites[2].factoryId = factoryDataWithCategories[1].id; // 深圳科技园站点
    await db.insert(sitesTable).values(sites);

    // 13. 插入站点分类数据
    console.log("📂 插入站点分类数据...");
    // 设置站点分类的ID
    siteCategories[0].siteId = sites[0].id; // 环球贸易站点
    siteCategories[1].siteId = sites[0].id; // 环球贸易站点
    siteCategories[2].siteId = sites[1].id; // 东莞电子制造厂站点

    siteCategories[0].masterCategoryId = categories[0].id; // 电子产品
    siteCategories[1].masterCategoryId = categories[0].id; // 电子产品
    siteCategories[1].parentId = siteCategories[0].id; // 手机是电子产品的子分类
    siteCategories[2].masterCategoryId = categories[0].id; // 电子产品

    await db.insert(siteCategoriesTable).values(siteCategories);

    // 14. 插入用户站点角色关联数据
    console.log("👑 插入用户站点角色关联...");
    const userSiteRoles = [
      // 超级管理员 - 可以访问所有站点
      {
        userId: users[0].id,
        siteId: sites[0].id,
        roleId: roles[3].id, // super_admin
      },
      // 张三 - 出口商管理员
      {
        userId: users[1].id,
        siteId: sites[0].id,
        roleId: roles[0].id, // exporter_admin
      },
      // 李四 - 工厂管理员
      {
        userId: users[2].id,
        siteId: sites[1].id,
        roleId: roles[1].id, // factory_admin
      },
      // 王五 - 业务员
      {
        userId: users[3].id,
        siteId: sites[0].id,
        roleId: roles[2].id, // salesperson
      },
      // 赵六 - 业务员
      {
        userId: users[4].id,
        siteId: sites[1].id,
        roleId: roles[2].id, // salesperson
      },
      // 陈七 - 业务员
      {
        userId: users[5].id,
        siteId: sites[2].id,
        roleId: roles[2].id, // salesperson
      },
    ];
    await db.insert(userSiteRolesTable).values(userSiteRoles);

    // 15. 插入商品数据
    console.log("🛍️ 插入商品数据...");
    products[0].factoryId = factoryDataWithCategories[0].id; // 智能手机 - 电子厂
    products[1].factoryId = factoryDataWithCategories[2].id; // 运动T恤 - 服装厂
    await db.insert(productsTable).values(products);

    // 16. 插入SKU数据
    console.log("📦 插入SKU数据...");
    skus[0].productId = products[0].id; // 智能手机 SKU
    skus[1].productId = products[0].id;
    skus[2].productId = products[1].id; // 运动T恤 SKU
    await db.insert(skusTable).values(skus);

    // 17. 插入商品模板关联
    console.log("📋 插入商品模板关联...");
    const productTemplates = [
      { productId: products[0].id, templateId: attributeTemplates[0].id }, // 智能手机 - 电子产品模板
      { productId: products[1].id, templateId: attributeTemplates[1].id }, // 运动T恤 - 服装模板
    ];
    await db.insert(productTemplateTable).values(productTemplates);

    // 18. 插入站点商品关联数据
    console.log("🛒 插入站点商品关联数据...");
    const siteProducts = [
      {
        siteId: sites[0].id, // 环球贸易站点
        productId: products[0].id, // 智能手机
        isFeatured: true,
        sortOrder: 1,
        isVisible: true,
        siteCategoryId: siteCategories[1].id, // 手机分类
      },
      {
        siteId: sites[1].id, // 东莞电子制造厂站点
        productId: products[0].id, // 智能手机
        isFeatured: true,
        sortOrder: 1,
        isVisible: true,
        siteCategoryId: siteCategories[2].id, // 主打产品分类
      },
    ];
    await db.insert(siteProductsTable).values(siteProducts);

    // 19. 插入主页卡片数据（需要siteId）
    console.log("🎨 插入主页卡片数据...");
    const heroCardsWithSite = heroCards.map((card) => ({
      ...card,
      siteId: sites[0].id, // 默认添加到环球贸易站点
    }));
    await db.insert(heroCardsTable).values(heroCardsWithSite);

    // 20. 插入站点配置数据
    console.log("⚙️ 插入站点配置数据...");
    // 设置站点配置的siteId
    siteConfigs2[0].siteId = sites[0].id; // 环球贸易站点
    siteConfigs2[1].siteId = sites[0].id; // 环球贸易站点
    await db.insert(siteConfigTable).values(siteConfigs2);

    // 21. 插入翻译字典数据
    console.log("🌍 插入翻译字典数据...");
    await db.insert(translationDictTable).values(translationDict);

    // 22. 插入每日询盘计数器数据
    console.log("📊 插入每日询盘计数器数据...");
    await db.insert(dailyInquiryCounterTable).values(dailyInquiryCounter);

    // 23. 插入客户数据
    console.log("🏢 插入客户数据...");
    await db.insert(CustomerTable).values(customers);

    console.log("✅ 数据库初始化完成！");
    console.log("\n📝 创建的账号信息：");
    console.log("1. 超级管理员: super@admin.com");
    console.log("2. 出口商管理员: admin@exporter.com");
    console.log("3. 工厂管理员: factory@manager.com");
    console.log("4. 业务员1: sales@rep.com");
    console.log("5. 业务员2: john@example.com");
    console.log("6. 业务员3: jane@example.com");
    console.log("\n💡 所有账号的密码都是: 12345678");
    console.log("\n📊 初始化的数据包括：");
    console.log("- 4个角色及其权限");
    console.log("- 22个权限");
    console.log("- 8个产品分类");
    console.log("- 3个属性模板");
    console.log("- 4个属性定义");
    console.log("- 16个属性值");
    console.log("- 2个出口商");
    console.log("- 3个工厂");
    console.log("- 6个用户");
    console.log("- 3个站点");
    console.log("- 3个站点分类");
    console.log("- 2个站点商品关联");
    console.log("- 2个示例商品");
    console.log("- 3个SKU");
    console.log("- 3个主页卡片");
    console.log("- 站点配置、翻译字典、每日询盘计数器、客户数据等");
  } catch (error) {
    console.error("❌ 数据库初始化失败:", error);
    process.exit(1);
  }
}

// 运行初始化
seedCompleteDatabase();
