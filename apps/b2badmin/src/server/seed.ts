import {
  CustomerTable,
  categoriesTable,
  exportersTable,
  factoriesTable,
  heroCardsTable,
  roleTable,
  siteConfigTable,
  userResourceRolesTable,
  userRolesTable,
  usersTable,
} from "@repo/contract/table";
import { randomUUIDv7 } from "bun";
import { db } from "./db/connection";

// 角色数据
const roles = [
  { id: randomUUIDv7(), name: "exporter_admin", description: "出口商管理员" },
  { id: randomUUIDv7(), name: "factory_admin", description: "工厂管理员" },
  { id: randomUUIDv7(), name: "salesperson", description: "业务员" },
];

// 工厂数据
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
  {
    id: randomUUIDv7(),
    name: "佛山陶瓷厂",
    code: "FS_CERAMICS",
    website: "https://www.fs-ceramics.com",
    address: "佛山市禅城区陶瓷城",
    categoryId: "", // 稍后设置
    contactPhone: "13800138004",
    isActive: true,
    isVerified: false,
    mainProducts: "日用陶瓷、艺术陶瓷、建筑陶瓷",
    annualRevenue: "2000万-3000万",
    employeeCount: 150,
  },
  {
    id: randomUUIDv7(),
    name: "中山灯具厂",
    code: "ZS_LIGHTING",
    website: "https://www.zs-lighting.com",
    address: "中山市古镇灯饰产业园",
    categoryId: "", // 稍后设置
    contactPhone: "13800138005",
    isActive: true,
    isVerified: true,
    mainProducts: "LED灯具、家居照明、商业照明",
    annualRevenue: "4000万-6000万",
    employeeCount: 250,
  },
];

// 出口商数据
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
  {
    id: randomUUIDv7(),
    name: "欧亚贸易集团",
    code: "EURASIA_GROUP",
    address: "上海市浦东新区",
    contact: "13800138008",
  },
  {
    id: randomUUIDv7(),
    name: "亚太供应链",
    code: "ASIA_PACIFIC",
    address: "北京市朝阳区",
    contact: "13800138009",
  },
  {
    id: randomUUIDv7(),
    name: "金桥国际",
    code: "GOLDEN_BRIDGE",
    address: "杭州市西湖区",
    contact: "13800138010",
  },
];

// 用户数据
const users = [
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

// 产品分类数据
const categories = [
  {
    id: randomUUIDv7(),
    name: "electronics",
    slug: "electronics",
    description: "electronics.description",
    parentId: null,
    sortOrder: 1,
    isVisible: true,
    icon: "electronics",
  },
  {
    id: randomUUIDv7(),
    name: "clothing",
    slug: "clothing",
    description: "clothing.description",
    parentId: null,
    sortOrder: 2,
    isVisible: true,
    icon: "clothing",
  },
  {
    id: randomUUIDv7(),
    name: "home",
    slug: "home",
    description: "home.description",
    parentId: null,
    sortOrder: 3,
    isVisible: true,
    icon: "home",
  },
  {
    id: randomUUIDv7(),
    name: "sports",
    slug: "sports",
    description: "sports.description",
    parentId: null,
    sortOrder: 4,
    isVisible: true,
    icon: "sports",
  },
  {
    id: randomUUIDv7(),
    name: "food",
    slug: "food",
    description: "food.description",
    parentId: null,
    sortOrder: 5,
    isVisible: true,
    icon: "food",
  },
];

// 主页卡片数据
const heroCards = [
  {
    id: randomUUIDv7(),
    title: "优质工厂资源",
    description: "我们提供经过严格筛选的工厂资源，确保产品质量",
    buttonText: "查看工厂",
    buttonUrl: "/factories",
    backgroundClass: "bg-blue-50",
    imageId: null, // 需要先上传媒体文件
    sortOrder: 1,
    isActive: true,
  },
  {
    id: randomUUIDv7(),
    title: "一站式采购",
    description: "从询价到发货，我们提供全方位服务",
    buttonText: "立即采购",
    buttonUrl: "/products",
    backgroundClass: "bg-green-50",
    imageId: null,
    sortOrder: 2,
    isActive: true,
  },
  {
    id: randomUUIDv7(),
    title: "质量保证",
    description: "每件产品都经过严格的质量检验",
    buttonText: "了解详情",
    buttonUrl: "/quality",
    backgroundClass: "bg-purple-50",
    imageId: null,
    sortOrder: 3,
    isActive: true,
  },
];

// 站点配置数据
const siteConfigs = [
  { key: "site_name", value: "Gina 采购平台", description: "站点名称" },
  {
    key: "site_description",
    value: "专业的B2B采购平台",
    description: "站点描述",
  },
  { key: "contact_email", value: "contact@gina.com", description: "联系邮箱" },
  { key: "contact_phone", value: "+86 400-123-4567", description: "联系电话" },
  {
    key: "company_address",
    value: "深圳市南山区科技园",
    description: "公司地址",
  },
];

// 客户数据
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
  {
    id: randomUUIDv7(),
    companyName: "日本贸易社",
    name: "田中太郎",
    email: "info@japan-trade.jp",
    whatsapp: "+81312345678",
    phone: "0312345678",
    address: "東京都港区六本木3-2-1, 106-0032, Japan",
  },
  {
    id: randomUUIDv7(),
    companyName: "英国进口商",
    name: "James Wilson",
    email: "sales@uk-importer.co.uk",
    whatsapp: "+442079460958",
    phone: "2079460958",
    address: "10 Downing Street, London SW1A 2AA, UK",
  },
  {
    id: randomUUIDv7(),
    companyName: "澳大利亚批发商",
    name: "Jack Anderson",
    email: "contact@au-wholesale.au",
    whatsapp: "+61293744000",
    phone: "293744000",
    address: "1 Martin Place, Sydney NSW 2000, Australia",
  },
];

async function seedDatabase() {
  try {
    console.log("🌱 开始初始化数据库数据...");

    // 1. 插入角色数据
    console.log("📋 插入角色数据...");
    await db.insert(roleTable).values(roles);

    // 2. 插入产品分类数据（需要在工厂之前插入，因为工厂需要引用分类ID）
    console.log("📦 插入产品分类数据...");
    await db.insert(categoriesTable).values(categories);

    // 3. 插入工厂数据（分配categoryId）
    console.log("🏭 插入工厂数据...");
    const factoryDataWithCategories = factoryData.map((factory, index) => ({
      ...factory,
      categoryId: categories[index % categories.length].id, // 循环分配分类ID
    }));
    await db.insert(factoriesTable).values(factoryDataWithCategories);

    // 4. 插入出口商数据
    console.log("🚢 插入出口商数据...");
    await db.insert(exportersTable).values(exporterData);

    // 5. 插入用户数据
    console.log("👥 插入用户数据...");
    await db.insert(usersTable).values(users);

    // 6. 插入用户角色关联数据
    console.log("🔗 插入用户角色关联...");
    const userRoleRelations = [
      // 张三 - 出口商管理员
      { id: randomUUIDv7(), userId: users[0].id, roleId: roles[0].id },
      // 李四 - 工厂管理员
      { id: randomUUIDv7(), userId: users[1].id, roleId: roles[1].id },
      // 王五 - 业务员
      { id: randomUUIDv7(), userId: users[2].id, roleId: roles[2].id },
      // 其他用户 - 业务员
      { id: randomUUIDv7(), userId: users[3].id, roleId: roles[2].id },
      { id: randomUUIDv7(), userId: users[4].id, roleId: roles[2].id },
    ];
    await db.insert(userRolesTable).values(userRoleRelations);

    // 7. 插入用户资源角色关联数据
    console.log("🏢 插入用户资源关联...");
    const userResourceRoles = [
      // 张三 - 管理出口商1
      {
        id: randomUUIDv7(),
        userId: users[0].id,
        roleId: roles[0].id,
        resourceType: "exporter",
        resourceId: exporterData[0].id,
        isPrimary: true,
      },
      {
        id: randomUUIDv7(),
        userId: users[0].id,
        roleId: roles[0].id,
        resourceType: "exporter",
        resourceId: exporterData[1].id,
        isPrimary: false,
      },
      // 李四 - 管理工厂1（使用factoryDataWithCategories中的ID）
      {
        id: randomUUIDv7(),
        userId: users[1].id,
        roleId: roles[1].id,
        resourceType: "factory",
        resourceId: factoryDataWithCategories[0].id,
        isPrimary: true,
      },
      {
        id: randomUUIDv7(),
        userId: users[1].id,
        roleId: roles[1].id,
        resourceType: "factory",
        resourceId: factoryDataWithCategories[1].id,
        isPrimary: false,
      },
      // 王五 - 业务员，分配到出口商1
      {
        id: randomUUIDv7(),
        userId: users[2].id,
        roleId: roles[2].id,
        resourceType: "exporter",
        resourceId: exporterData[0].id,
        isPrimary: true,
      },
      // 赵六 - 业务员，分配到工厂1
      {
        id: randomUUIDv7(),
        userId: users[3].id,
        roleId: roles[2].id,
        resourceType: "factory",
        resourceId: factoryDataWithCategories[0].id,
        isPrimary: true,
      },
      // 陈七 - 业务员，分配到出口商2
      {
        id: randomUUIDv7(),
        userId: users[4].id,
        roleId: roles[2].id,
        resourceType: "exporter",
        resourceId: exporterData[1].id,
        isPrimary: true,
      },
    ];
    await db.insert(userResourceRolesTable).values(userResourceRoles);

    // 8. 插入主页卡片数据
    console.log("🎨 插入主页卡片数据...");
    await db.insert(heroCardsTable).values(heroCards);

    // 9. 插入站点配置数据
    console.log("⚙️ 插入站点配置数据...");
    await db.insert(siteConfigTable).values(siteConfigs);

    // 10. 插入客户数据
    console.log("🏢 插入客户数据...");
    await db.insert(CustomerTable).values(customers);

    console.log("✅ 数据库初始化完成！");
    console.log("\n📝 创建的账号信息：");
    console.log("1. 出口商管理员: admin@exporter.com");
    console.log("2. 工厂管理员: factory@manager.com");
    console.log("3. 业务员1: sales@rep.com");
    console.log("4. 业务员2: john@example.com");
    console.log("5. 业务员3: jane@example.com");
    console.log("\n💡 所有账号的默认密码都是: password123");
  } catch (error) {
    console.error("❌ 数据库初始化失败:", error);
    process.exit(1);
  }
}

// 运行初始化
seedDatabase();
