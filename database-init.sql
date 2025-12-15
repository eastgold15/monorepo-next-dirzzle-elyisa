-- 数据库初始化SQL文件
-- 创建时间: 2025-12-15

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建所有枚举类型
DO $$BEGIN
    CREATE TYPE ads_type AS ENUM ('banner', 'carousel', 'list');
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TYPE ads_position AS ENUM ('home-top', 'home-middle', 'sidebar');
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TYPE inquiry_status AS ENUM ('pending', 'quoted', 'sent', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TYPE media_status AS ENUM ('active', 'deleted');
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TYPE media_type AS ENUM ('image', 'video', 'document', 'audio', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TYPE input_type AS ENUM ('select', 'text', 'number', 'multiselect', 'richtext');
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

-- 创建用户表
CREATE TABLE IF NOT EXISTS "user_table" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT
);

-- 创建账户表（OAuth认证）
CREATE TABLE IF NOT EXISTS "account" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL REFERENCES "user_table"("id") ON DELETE CASCADE,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMPTZ,
    "refresh_token_expires_at" TIMESTAMPTZ,
    "scope" TEXT,
    "password" TEXT
);

-- 创建会话表
CREATE TABLE IF NOT EXISTS "session" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "expires_at" TIMESTAMPTZ NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" UUID NOT NULL REFERENCES "user_table"("id") ON DELETE CASCADE
);

-- 创建验证表
CREATE TABLE IF NOT EXISTS "verification" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL
);

-- 创建用户档案表
CREATE TABLE IF NOT EXISTS "userprofile" (
    "user_id" UUID PRIMARY KEY REFERENCES "user_table"("id") ON DELETE CASCADE,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT
);

-- 创建角色表
CREATE TABLE IF NOT EXISTS "roles" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT
);

-- 创建用户角色关联表
CREATE TABLE IF NOT EXISTS "user_roles" (
    "user_id" UUID NOT NULL REFERENCES "user_table"("id") ON DELETE CASCADE,
    "role_id" UUID NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
    PRIMARY KEY ("user_id", "role_id")
);

-- 创建权限表
CREATE TABLE IF NOT EXISTS "permissions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- 创建角色权限关联表
CREATE TABLE IF NOT EXISTS "role_permissions" (
    "role_id" UUID NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
    "permission_id" UUID NOT NULL REFERENCES "permissions"("id") ON DELETE CASCADE,
    PRIMARY KEY ("role_id", "permission_id")
);

-- 创建用户资源角色关联表
CREATE TABLE IF NOT EXISTS "user_resource_roles" (
    "user_id" UUID NOT NULL REFERENCES "user_table"("id") ON DELETE CASCADE,
    "role_id" UUID NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
    "resource_type" TEXT NOT NULL,
    "resource_id" UUID NOT NULL,
    "is_primary" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY ("user_id", "resource_type", "resource_id")
);

-- 创建出口商表
CREATE TABLE IF NOT EXISTS "exporters" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(50) UNIQUE NOT NULL,
    "address" TEXT,
    "website" VARCHAR(500),
    "bank_info" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false
);

-- 创建分类表
CREATE TABLE IF NOT EXISTS "categories" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL UNIQUE,
    "description" VARCHAR(255) NOT NULL,
    "parent_id" UUID,
    "sort_order" INTEGER DEFAULT 0,
    "is_visible" BOOLEAN DEFAULT true,
    "icon" VARCHAR(255) DEFAULT '',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建工厂表
CREATE TABLE IF NOT EXISTS "factories" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(50) UNIQUE NOT NULL,
    "description" TEXT,
    "website" VARCHAR(500) NOT NULL,
    "address" TEXT NOT NULL,
    "contact_phone" VARCHAR(50) NOT NULL,
    "logo" VARCHAR(500),
    "exporter_id" UUID REFERENCES "exporters"("id"),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "business_license" VARCHAR(500),
    "main_products" TEXT,
    "annual_revenue" VARCHAR(100),
    "employee_count" INTEGER
);

-- 创建工厂分类关联表
CREATE TABLE IF NOT EXISTS "factory_category" (
    "factory_id" UUID NOT NULL REFERENCES "factories"("id") ON DELETE CASCADE,
    "category_id" UUID NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
    PRIMARY KEY ("factory_id", "category_id")
);

-- 创建销售员表
CREATE TABLE IF NOT EXISTS "salespersons" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "user_id" UUID NOT NULL UNIQUE REFERENCES "user_table"("id") ON DELETE CASCADE,
    "factory_id" UUID NOT NULL REFERENCES "factories"("id") ON DELETE CASCADE,
    "phone" VARCHAR(50),
    "whatsapp" VARCHAR(50),
    "position" VARCHAR(100),
    "department" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "avatar" VARCHAR(500),
    "last_assigned_at" TIMESTAMPTZ
);

-- 创建销售员分类关联表
CREATE TABLE IF NOT EXISTS "salesperson_categories" (
    "salesperson_id" UUID NOT NULL REFERENCES "salespersons"("id") ON DELETE CASCADE,
    "category_id" UUID NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
    PRIMARY KEY ("salesperson_id", "category_id")
);

-- 创建媒体表
CREATE TABLE IF NOT EXISTS "media" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "storage_key" VARCHAR(255) NOT NULL,
    "category" VARCHAR(255) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "user_id" UUID REFERENCES "user_table"("id") ON DELETE CASCADE,
    "factory_id" UUID REFERENCES "factories"("id") ON DELETE CASCADE,
    "original_name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "is_public" BOOLEAN NOT NULL DEFAULT false
);

-- 创建媒体元数据表
CREATE TABLE IF NOT EXISTS "media_metadata" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "file_id" UUID NOT NULL REFERENCES "media"("id") ON DELETE CASCADE,
    "media_type" media_type NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "duration" INTEGER,
    "metadata_json" TEXT DEFAULT '',
    "thumbnail_key" VARCHAR(255)
);

-- 创建广告表
CREATE TABLE IF NOT EXISTS "advertisements" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "type" ads_type NOT NULL,
    "image_id" UUID NOT NULL REFERENCES "media"("id"),
    "link" VARCHAR(500) NOT NULL,
    "position" ads_position DEFAULT 'home-top',
    "sort_order" INTEGER DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL
);

-- 创建英雄卡片表
CREATE TABLE IF NOT EXISTS "hero_cards" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "button_text" VARCHAR(100) NOT NULL,
    "button_url" VARCHAR(500),
    "background_class" VARCHAR(100) DEFAULT 'bg-blue-50',
    "image_id" UUID REFERENCES "media"("id"),
    "sort_order" INTEGER DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true
);

-- 创建产品表
CREATE TABLE IF NOT EXISTS "products_table" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "spu_code" VARCHAR(64) NOT NULL UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "factory_id" UUID REFERENCES "factories"("id") ON DELETE RESTRICT,
    "units" VARCHAR(20)
);

-- 创建产品分类关联表
CREATE TABLE IF NOT EXISTS "product_categories" (
    "product_id" UUID NOT NULL REFERENCES "products_table"("id"),
    "category_id" UUID NOT NULL REFERENCES "categories"("id"),
    PRIMARY KEY ("product_id", "category_id")
);

-- 创建产品媒体关联表
CREATE TABLE IF NOT EXISTS "product_images" (
    "product_id" UUID NOT NULL REFERENCES "products_table"("id"),
    "image_id" UUID NOT NULL REFERENCES "media"("id"),
    "is_main" BOOLEAN DEFAULT false,
    PRIMARY KEY ("product_id", "image_id")
);

-- 创建属性模板表
CREATE TABLE IF NOT EXISTS "attribute_templates" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "name" VARCHAR(100) NOT NULL,
    "category_id" UUID NOT NULL REFERENCES "categories"("id")
);

-- 创建属性表
CREATE TABLE IF NOT EXISTS "attributes_table" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "template_id" UUID NOT NULL REFERENCES "attribute_templates"("id"),
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "input_type" input_type DEFAULT 'select',
    "is_required" BOOLEAN DEFAULT true,
    "is_sale_attr" BOOLEAN DEFAULT true,
    "sort_order" INTEGER DEFAULT 0
);

-- 创建属性值表
CREATE TABLE IF NOT EXISTS "attribute_values_table" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "attribute_id" UUID NOT NULL REFERENCES "attributes_table"("id"),
    "value" VARCHAR(100) NOT NULL,
    "value_code" VARCHAR(50) NOT NULL,
    "sort_order" INTEGER DEFAULT 0
);

-- 创建产品模板关联表
CREATE TABLE IF NOT EXISTS "product_template_table" (
    "product_id" UUID PRIMARY KEY REFERENCES "products_table"("id") ON DELETE CASCADE,
    "template_id" UUID NOT NULL REFERENCES "attribute_templates"("id")
);

-- 创建SKU表
CREATE TABLE IF NOT EXISTS "skus_table" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "sku_code" VARCHAR(100) NOT NULL UNIQUE,
    "product_id" UUID NOT NULL,
    "image_id" UUID REFERENCES "media"("id"),
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "market_price" DECIMAL(10,2),
    "cost_price" DECIMAL(10,2),
    "weight" DECIMAL(8,3) DEFAULT 0.000,
    "volume" DECIMAL(10,3) DEFAULT 0.000,
    "stock" DECIMAL DEFAULT 0,
    "spec_json" JSONB NOT NULL,
    "extra_attributes" JSONB,
    "status" INTEGER NOT NULL DEFAULT 1
);

-- 创建产品工厂关联表
CREATE TABLE IF NOT EXISTS "product_factories" (
    "product_id" UUID NOT NULL REFERENCES "products_table"("id") ON DELETE CASCADE,
    "factory_id" UUID NOT NULL REFERENCES "factories"("id") ON DELETE CASCADE,
    PRIMARY KEY ("product_id", "factory_id")
);

-- 创建产品统计表
CREATE TABLE IF NOT EXISTS "product_statistics" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "product_id" INTEGER,
    "date" VARCHAR(10) NOT NULL,
    "view_type" VARCHAR(50) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0
);

-- 创建客户表
CREATE TABLE IF NOT EXISTS "customer" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "company_name" VARCHAR(200) NOT NULL,
    "contact_name" VARCHAR(100),
    "email" VARCHAR(255),
    "whatsapp" VARCHAR(50),
    "phone" VARCHAR(20),
    "address" TEXT
);

-- 创建询盘表
CREATE TABLE IF NOT EXISTS "inquiries" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "customer_name" VARCHAR(100),
    "company_name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" INTEGER,
    "whatsapp" VARCHAR(50),
    "status" inquiry_status DEFAULT 'pending' NOT NULL
);

-- 创建询盘项目表
CREATE TABLE IF NOT EXISTS "inquiry_items" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "inquiry_id" UUID NOT NULL REFERENCES "inquiries"("id") ON DELETE CASCADE,
    "Sku_id" UUID NOT NULL REFERENCES "skus_table"("id"),
    "product_name" VARCHAR(255) NOT NULL,
    "product_description" TEXT,
    "sku_quantity" INTEGER NOT NULL,
    "sku_image" VARCHAR(500),
    "sku_price" DECIMAL(10,2),
    "payment_method" VARCHAR(255) NOT NULL,
    "customer_requirements" TEXT
);

-- 创建报价表
CREATE TABLE IF NOT EXISTS "quotations" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ref_no" VARCHAR(50) NOT NULL,
    "date" DATE NOT NULL,
    "client_id" UUID NOT NULL REFERENCES "customer"("id") ON DELETE RESTRICT,
    "exporter_id" UUID NOT NULL REFERENCES "exporters"("id") ON DELETE RESTRICT,
    "delivery_time_days" VARCHAR(50),
    "sample_leadtime_days" VARCHAR(50),
    "payment_terms" TEXT,
    "quality_remark" TEXT,
    "safety_compliance" TEXT,
    "status" VARCHAR(20) DEFAULT 'draft' NOT NULL
);

-- 创建报价项目表
CREATE TABLE IF NOT EXISTS "quotation_items" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "quotation_id" UUID NOT NULL REFERENCES "quotations"("id") ON DELETE CASCADE,
    "product_id" UUID NOT NULL REFERENCES "products_table"("id") ON DELETE RESTRICT,
    "factory_id" UUID NOT NULL REFERENCES "factories"("id") ON DELETE RESTRICT,
    "unit_price_usd" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total_usd" DECIMAL(12,2) NOT NULL,
    "remark" TEXT
);

-- 创建站点配置表
CREATE TABLE IF NOT EXISTS "site_config" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "key" VARCHAR(100) NOT NULL UNIQUE,
    "value" TEXT NOT NULL DEFAULT '',
    "description" TEXT DEFAULT '',
    "category" VARCHAR(50) DEFAULT 'general',
    "url" VARCHAR(255) DEFAULT '',
    "translatable" BOOLEAN DEFAULT true,
    "visible" BOOLEAN DEFAULT false
);

-- 创建每日询盘计数器表
CREATE TABLE IF NOT EXISTS "daily_inquiry_counter" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "date" VARCHAR(10) NOT NULL UNIQUE,
    "count" INTEGER NOT NULL DEFAULT 0,
    "last_reset_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 创建翻译字典表
CREATE TABLE IF NOT EXISTS "translation_dict" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "key" VARCHAR(255) NOT NULL UNIQUE,
    "category" VARCHAR(100) DEFAULT 'general',
    "description" TEXT,
    "translations" JSONB NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 多站点支持表
-- 创建站点表
CREATE TABLE IF NOT EXISTS "sites" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "name" VARCHAR(100) NOT NULL,
    "domain" VARCHAR(255) UNIQUE NOT NULL,
    "site_type" VARCHAR(10) NOT NULL CHECK (site_type IN ('factory', 'exporter')),
    "entity_id" UUID NOT NULL,
    "theme_config" JSONB,
    "feature_config" JSONB,
    "is_active" BOOLEAN DEFAULT true
);

-- 创建站点分类表
CREATE TABLE IF NOT EXISTS "site_categories" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "site_id" UUID NOT NULL REFERENCES "sites"("id"),
    "name" VARCHAR(100) NOT NULL,
    "parent_id" UUID,
    "sort_order" INTEGER DEFAULT 0,
    "global_category_id" UUID REFERENCES "categories"("id"),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建站点商品关联表
CREATE TABLE IF NOT EXISTS "site_products" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "site_id" UUID NOT NULL REFERENCES "sites"("id"),
    "product_id" UUID NOT NULL REFERENCES "products_table"("id"),
    "site_price" DECIMAL(10,2),
    "site_name" VARCHAR(200),
    "site_description" TEXT,
    "is_featured" BOOLEAN DEFAULT false,
    "sort_order" INTEGER DEFAULT 0,
    "is_visible" BOOLEAN DEFAULT true,
    "seo_title" VARCHAR(200),
    "seo_description" TEXT,
    "site_category_id" UUID REFERENCES "site_categories"("id")
);

-- 创建用户站点权限表
CREATE TABLE IF NOT EXISTS "user_site_permissions" (
    "user_id" UUID NOT NULL REFERENCES "user_table"("id"),
    "site_id" UUID NOT NULL REFERENCES "sites"("id"),
    "role" VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY ("user_id", "site_id")
);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有需要的表添加更新时间触发器（使用 DO 块避免重复创建）
DO $$BEGIN
    CREATE TRIGGER update_user_table_updated_at BEFORE UPDATE ON "user_table" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_account_updated_at BEFORE UPDATE ON "account" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_session_updated_at BEFORE UPDATE ON "session" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_verification_updated_at BEFORE UPDATE ON "verification" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

-- roles table doesn't have updated_at column, no trigger needed

DO $$BEGIN
    CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON "permissions" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_user_resource_roles_updated_at BEFORE UPDATE ON "user_resource_roles" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_exporters_updated_at BEFORE UPDATE ON "exporters" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON "categories" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_factories_updated_at BEFORE UPDATE ON "factories" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_salespersons_updated_at BEFORE UPDATE ON "salespersons" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON "media" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_advertisements_updated_at BEFORE UPDATE ON "advertisements" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_hero_cards_updated_at BEFORE UPDATE ON "hero_cards" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_products_table_updated_at BEFORE UPDATE ON "products_table" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_attributes_table_updated_at BEFORE UPDATE ON "attributes_table" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_attribute_values_table_updated_at BEFORE UPDATE ON "attribute_values_table" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_skus_table_updated_at BEFORE UPDATE ON "skus_table" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_product_statistics_updated_at BEFORE UPDATE ON "product_statistics" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_customer_updated_at BEFORE UPDATE ON "customer" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON "inquiries" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_inquiry_items_updated_at BEFORE UPDATE ON "inquiry_items" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON "quotations" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_quotation_items_updated_at BEFORE UPDATE ON "quotation_items" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON "site_config" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_daily_inquiry_counter_updated_at BEFORE UPDATE ON "daily_inquiry_counter" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_translation_dict_updated_at BEFORE UPDATE ON "translation_dict" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON "sites" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_site_categories_updated_at BEFORE UPDATE ON "site_categories" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_site_products_updated_at BEFORE UPDATE ON "site_products" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

DO $$BEGIN
    CREATE TRIGGER update_user_site_permissions_updated_at BEFORE UPDATE ON "user_site_permissions" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END$$;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_email ON "user_table"("email");
CREATE INDEX IF NOT EXISTS idx_account_user_id ON "account"("user_id");
CREATE INDEX IF NOT EXISTS idx_session_user_id ON "session"("user_id");
CREATE INDEX IF NOT EXISTS idx_session_token ON "session"("token");
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON "user_roles"("user_id");
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON "user_roles"("role_id");
CREATE INDEX IF NOT EXISTS idx_factories_exporter_id ON "factories"("exporter_id");
CREATE INDEX IF NOT EXISTS idx_salespersons_user_id ON "salespersons"("user_id");
CREATE INDEX IF NOT EXISTS idx_salespersons_factory_id ON "salespersons"("factory_id");
CREATE INDEX IF NOT EXISTS idx_media_user_id ON "media"("user_id");
CREATE INDEX IF NOT EXISTS idx_media_factory_id ON "media"("factory_id");
CREATE INDEX IF NOT EXISTS idx_products_factory_id ON "products_table"("factory_id");
CREATE INDEX IF NOT EXISTS idx_skus_product_id ON "skus_table"("product_id");
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON "inquiries"("status");
CREATE INDEX IF NOT EXISTS idx_quotations_status ON "quotations"("status");
CREATE INDEX IF NOT EXISTS idx_sites_domain ON "sites"("domain");
CREATE INDEX IF NOT EXISTS idx_sites_site_type ON "sites"("site_type");

-- 插入默认角色
INSERT INTO "roles" ("id", "name", "description") VALUES
    (uuid_generate_v4(), 'super_admin', '超级管理员'),
    (uuid_generate_v4(), 'exporter_admin', '出口商管理员'),
    (uuid_generate_v4(), 'factory_admin', '工厂管理员'),
    (uuid_generate_v4(), 'salesperson', '销售员'),
    (uuid_generate_v4(), 'customer', '客户')
ON CONFLICT (name) DO NOTHING;

-- 插入默认权限
INSERT INTO "permissions" ("id", "name", "description", "created_at", "updated_at") VALUES
    (uuid_generate_v4(), 'user.create', '创建用户', NOW(), NOW()),
    (uuid_generate_v4(), 'user.read', '查看用户', NOW(), NOW()),
    (uuid_generate_v4(), 'user.update', '更新用户', NOW(), NOW()),
    (uuid_generate_v4(), 'user.delete', '删除用户', NOW(), NOW()),
    (uuid_generate_v4(), 'factory.create', '创建工厂', NOW(), NOW()),
    (uuid_generate_v4(), 'factory.read', '查看工厂', NOW(), NOW()),
    (uuid_generate_v4(), 'factory.update', '更新工厂', NOW(), NOW()),
    (uuid_generate_v4(), 'factory.delete', '删除工厂', NOW(), NOW()),
    (uuid_generate_v4(), 'product.create', '创建产品', NOW(), NOW()),
    (uuid_generate_v4(), 'product.read', '查看产品', NOW(), NOW()),
    (uuid_generate_v4(), 'product.update', '更新产品', NOW(), NOW()),
    (uuid_generate_v4(), 'product.delete', '删除产品', NOW(), NOW()),
    (uuid_generate_v4(), 'inquiry.create', '创建询盘', NOW(), NOW()),
    (uuid_generate_v4(), 'inquiry.read', '查看询盘', NOW(), NOW()),
    (uuid_generate_v4(), 'inquiry.update', '更新询盘', NOW(), NOW()),
    (uuid_generate_v4(), 'inquiry.delete', '删除询盘', NOW(), NOW()),
    (uuid_generate_v4(), 'quotation.create', '创建报价', NOW(), NOW()),
    (uuid_generate_v4(), 'quotation.read', '查看报价', NOW(), NOW()),
    (uuid_generate_v4(), 'quotation.update', '更新报价', NOW(), NOW()),
    (uuid_generate_v4(), 'quotation.delete', '删除报价', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 为超级管理员角色分配所有权限
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "roles" r, "permissions" p
WHERE r.name = 'super_admin'
ON CONFLICT ("role_id", "permission_id") DO NOTHING;

-- 插入默认的Better Auth管理员用户
-- 密码: admin123 (使用bcrypt哈希，默认salt rounds: 10)
INSERT INTO "user_table" ("id", "name", "email", "email_verified", "created_at", "updated_at") VALUES
    (uuid_generate_v4(), '系统管理员', 'admin@example.com', true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 获取管理员用户ID并创建账户记录
DO $$
DECLARE
    admin_user_id UUID;
    admin_role_id UUID;
BEGIN
    SELECT id INTO admin_user_id FROM "user_table" WHERE email = 'admin@example.com';
    SELECT id INTO admin_role_id FROM "roles" WHERE name = 'super_admin';

    IF admin_user_id IS NOT NULL THEN
        -- 插入账户记录，包含Better Auth格式的密码哈希
        INSERT INTO "account" (
            "id",
            "account_id",
            "provider_id",
            "user_id",
            "password",
            "created_at",
            "updated_at"
        ) VALUES (
            uuid_generate_v4(),
            admin_user_id::text,
            'credential',
            admin_user_id,
            '948ca608bf8799e01f412bc8e42e4384:18a873f36c8ccb79a0954f6ae5c66ecc0a1c14f113e6d3f0e65dd3d0deeb3257cdc3fa840021fe627cf6f399cb8beb9c597ed30967a8959badb5e782db934065',
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;

        -- 分配超级管理员角色
        IF admin_role_id IS NOT NULL THEN
            INSERT INTO "user_roles" ("user_id", "role_id")
            VALUES (admin_user_id, admin_role_id)
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;

-- 插入默认站点配置
INSERT INTO "site_config" ("id", "key", "value", "description", "category", "created_at", "updated_at") VALUES
    (uuid_generate_v4(), 'site_name', 'B2B电商平台', '网站名称', 'general', NOW(), NOW()),
    (uuid_generate_v4(), 'site_description', '专业的B2B电商平台', '网站描述', 'general', NOW(), NOW()),
    (uuid_generate_v4(), 'site_keywords', 'B2B,电商,贸易', '网站关键词', 'seo', NOW(), NOW()),
    (uuid_generate_v4(), 'contact_email', 'contact@example.com', '联系邮箱', 'contact', NOW(), NOW()),
    (uuid_generate_v4(), 'contact_phone', '+86-123-4567-8900', '联系电话', 'contact', NOW(), NOW()),
    (uuid_generate_v4(), 'company_address', '中国上海市浦东新区', '公司地址', 'contact', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- 插入默认分类
INSERT INTO "categories" ("id", "name", "slug", "description", "created_at", "updated_at") VALUES
    (uuid_generate_v4(), '电子产品', 'electronics', '各类电子设备和元件', NOW(), NOW()),
    (uuid_generate_v4(), '服装纺织', 'textiles', '服装和纺织品', NOW(), NOW()),
    (uuid_generate_v4(), '家居用品', 'home-garden', '家居和园艺用品', NOW(), NOW()),
    (uuid_generate_v4(), '工业设备', 'industrial', '工业设备和机械', NOW(), NOW()),
    (uuid_generate_v4(), '原材料', 'raw-materials', '各类原材料', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

COMMIT;