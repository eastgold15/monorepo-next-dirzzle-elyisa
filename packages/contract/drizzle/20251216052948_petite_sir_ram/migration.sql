CREATE TYPE "input_type" AS ENUM('select', 'text', 'number', 'multiselect', 'richtext');--> statement-breakpoint
CREATE TYPE "ads_position" AS ENUM('home-top', 'home-middle', 'sidebar');--> statement-breakpoint
CREATE TYPE "ads_type" AS ENUM('banner', 'carousel', 'list');--> statement-breakpoint
CREATE TYPE "entity_type" AS ENUM('exporter', 'factory');--> statement-breakpoint
CREATE TYPE "inquiry_status" AS ENUM('pending', 'quoted', 'sent', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "media_status" AS ENUM('active', 'deleted');--> statement-breakpoint
CREATE TYPE "media_type" AS ENUM('image', 'video', 'document', 'audio', 'other');--> statement-breakpoint
CREATE TABLE "customer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"company_name" varchar(200) NOT NULL,
	"contact_name" varchar(100),
	"email" varchar(255),
	"whatsapp" varchar(50),
	"phone" varchar(20),
	"address" text
);
--> statement-breakpoint
CREATE TABLE "master_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL UNIQUE,
	"description" varchar(255) NOT NULL,
	"parent_id" uuid,
	"sort_order" integer DEFAULT 0,
	"is_visible" boolean DEFAULT true,
	"icon" varchar(255) DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text
);
--> statement-breakpoint
CREATE TABLE "advertisements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"type" "ads_type" NOT NULL,
	"image_id" uuid NOT NULL,
	"link" varchar(500) NOT NULL,
	"ads_position" "ads_position" DEFAULT 'home-top'::"ads_position",
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"site_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attributes_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"template_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(50) NOT NULL,
	"input_type" "input_type" DEFAULT 'select'::"input_type",
	"is_required" boolean DEFAULT true,
	"is_sale_attr" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "attribute_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" varchar(100) NOT NULL,
	"category_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attribute_values_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attribute_id" uuid NOT NULL,
	"value" varchar(100) NOT NULL,
	"value_code" varchar(50) NOT NULL,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "daily_inquiry_counter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"date" varchar(10) NOT NULL UNIQUE,
	"count" integer DEFAULT 0 NOT NULL,
	"last_reset_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exporters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" varchar(200) NOT NULL,
	"code" varchar(50) NOT NULL UNIQUE,
	"address" text,
	"website" varchar(500),
	"bank_info" json,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "factories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" varchar(200) NOT NULL,
	"code" varchar(50) NOT NULL UNIQUE,
	"description" text,
	"website" varchar(500) NOT NULL,
	"address" text NOT NULL,
	"contact_phone" varchar(50) NOT NULL,
	"logo" varchar(500),
	"exporter_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"business_license" varchar(500),
	"main_products" text,
	"annual_revenue" varchar(100),
	"employee_count" integer
);
--> statement-breakpoint
CREATE TABLE "hero_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"button_text" varchar(100) NOT NULL,
	"button_url" varchar(500),
	"background_class" varchar(100) DEFAULT 'bg-blue-50',
	"image_id" uuid,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"site_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiry_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"inquiry_id" uuid NOT NULL,
	"Sku_id" uuid NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"product_description" text,
	"sku_quantity" integer NOT NULL,
	"sku_image" varchar(500),
	"sku_price" numeric(10,2),
	"payment_method" varchar(255) NOT NULL,
	"customer_requirements" text
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"customer_name" varchar(100),
	"company_name" varchar(200) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" integer,
	"whatsapp" varchar(50),
	"status" "inquiry_status" DEFAULT 'pending'::"inquiry_status" NOT NULL,
	"site_id" uuid
);
--> statement-breakpoint
CREATE TABLE "media_metadata" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"file_id" uuid NOT NULL,
	"media_type" "media_type" NOT NULL,
	"width" integer,
	"height" integer,
	"duration" integer,
	"metadata_json" text DEFAULT '',
	"thumbnail_key" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"storage_key" varchar(255) NOT NULL,
	"category" varchar NOT NULL,
	"url" varchar(255) NOT NULL,
	"user_id" uuid,
	"factory_id" uuid,
	"original_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"status" boolean DEFAULT true NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"product_id" uuid,
	"image_id" uuid,
	"is_main" boolean DEFAULT false,
	CONSTRAINT "product_images_pkey" PRIMARY KEY("product_id","image_id")
);
--> statement-breakpoint
CREATE TABLE "product_statistics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"product_id" integer,
	"date" varchar(10) NOT NULL,
	"view_type" varchar(50) NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_template_table" (
	"product_id" uuid PRIMARY KEY,
	"template_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"spu_code" varchar(64) NOT NULL UNIQUE,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" integer DEFAULT 1 NOT NULL,
	"units" varchar(20),
	"factory_id" uuid
);
--> statement-breakpoint
CREATE TABLE "quotation_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"quotation_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"factory_id" uuid NOT NULL,
	"unit_price_usd" numeric(10,2) NOT NULL,
	"quantity" integer NOT NULL,
	"total_usd" numeric(12,2) NOT NULL,
	"remark" text
);
--> statement-breakpoint
CREATE TABLE "quotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ref_no" varchar(50) NOT NULL,
	"date" date NOT NULL,
	"client_id" uuid NOT NULL,
	"exporter_id" uuid NOT NULL,
	"delivery_time_days" varchar(50),
	"sample_leadtime_days" varchar(50),
	"payment_terms" text,
	"quality_remark" text,
	"safety_compliance" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid,
	"permission_id" uuid,
	CONSTRAINT "role_permissions_pkey" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL UNIQUE,
	"description" text,
	"type" varchar DEFAULT 'custom' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"parent_role_id" uuid
);
--> statement-breakpoint
CREATE TABLE "salesperson_affiliations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"salesperson_id" uuid NOT NULL,
	"factory_id" uuid,
	"exporter_id" uuid,
	"entity_type" "entity_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salespersons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" uuid NOT NULL UNIQUE,
	"phone" varchar(50),
	"whatsapp" varchar(50),
	"position" varchar(100),
	"department" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"avatar" varchar(500),
	"last_assigned_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"site_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"parent_id" uuid,
	"sort_order" integer DEFAULT 0,
	"master_category_id" uuid
);
--> statement-breakpoint
CREATE TABLE "site_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"key" varchar(100) NOT NULL UNIQUE,
	"value" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '',
	"category" varchar(50) DEFAULT 'general',
	"url" varchar(255) DEFAULT '',
	"translatable" boolean DEFAULT true,
	"visible" boolean DEFAULT false,
	"site_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"site_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"site_price" numeric(10,2),
	"site_name" varchar(200),
	"site_description" text,
	"is_featured" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"is_visible" boolean DEFAULT true,
	"seo_title" varchar(200),
	"seo_description" text,
	"site_category_id" uuid
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" varchar(100) NOT NULL,
	"domain" varchar(255) NOT NULL UNIQUE,
	"site_type" "entity_type" NOT NULL,
	"factory_id" uuid,
	"exporter_id" uuid,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "skus_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sku_code" varchar(100) NOT NULL UNIQUE,
	"product_id" uuid NOT NULL,
	"image_id" uuid,
	"price" numeric(10,2) DEFAULT '0.00' NOT NULL,
	"market_price" numeric(10,2),
	"cost_price" numeric(10,2),
	"weight" numeric(8,3) DEFAULT '0.000',
	"volume" numeric(10,3) DEFAULT '0.000',
	"stock" numeric DEFAULT '0',
	"spec_json" json NOT NULL,
	"extra_attributes" json,
	"status" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "translation_dict" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"key" varchar(255) NOT NULL UNIQUE,
	"category" varchar(100) DEFAULT 'general',
	"description" text,
	"translations" json NOT NULL,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "user_site_roles" (
	"user_id" uuid,
	"site_id" uuid,
	"role_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_site_roles_pkey" PRIMARY KEY("user_id","site_id")
);
--> statement-breakpoint
CREATE TABLE "user_table" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"is_super_admin" boolean DEFAULT false NOT NULL,
	"phone" text,
	"address" text,
	"city" text
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_table_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_table"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_image_id_media_id_fkey" FOREIGN KEY ("image_id") REFERENCES "media"("id");--> statement-breakpoint
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_site_id_sites_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "attributes_table" ADD CONSTRAINT "attributes_table_template_id_attribute_templates_id_fkey" FOREIGN KEY ("template_id") REFERENCES "attribute_templates"("id");--> statement-breakpoint
ALTER TABLE "attribute_templates" ADD CONSTRAINT "attribute_templates_category_id_master_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "master_categories"("id");--> statement-breakpoint
ALTER TABLE "attribute_values_table" ADD CONSTRAINT "attribute_values_table_attribute_id_attributes_table_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes_table"("id");--> statement-breakpoint
ALTER TABLE "factories" ADD CONSTRAINT "factories_exporter_id_exporters_id_fkey" FOREIGN KEY ("exporter_id") REFERENCES "exporters"("id");--> statement-breakpoint
ALTER TABLE "hero_cards" ADD CONSTRAINT "hero_cards_image_id_media_id_fkey" FOREIGN KEY ("image_id") REFERENCES "media"("id");--> statement-breakpoint
ALTER TABLE "hero_cards" ADD CONSTRAINT "hero_cards_site_id_sites_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "inquiry_items" ADD CONSTRAINT "inquiry_items_inquiry_id_inquiries_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "inquiries"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "inquiry_items" ADD CONSTRAINT "inquiry_items_Sku_id_skus_table_id_fkey" FOREIGN KEY ("Sku_id") REFERENCES "skus_table"("id");--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_site_id_sites_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id");--> statement-breakpoint
ALTER TABLE "media_metadata" ADD CONSTRAINT "media_metadata_file_id_media_id_fkey" FOREIGN KEY ("file_id") REFERENCES "media"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_user_id_user_table_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_table"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_factory_id_factories_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factories"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_table_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products_table"("id");--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_image_id_media_id_fkey" FOREIGN KEY ("image_id") REFERENCES "media"("id");--> statement-breakpoint
ALTER TABLE "product_template_table" ADD CONSTRAINT "product_template_table_product_id_products_table_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products_table"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "product_template_table" ADD CONSTRAINT "product_template_table_template_id_attribute_templates_id_fkey" FOREIGN KEY ("template_id") REFERENCES "attribute_templates"("id");--> statement-breakpoint
ALTER TABLE "products_table" ADD CONSTRAINT "products_table_factory_id_factories_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factories"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotation_id_quotations_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_product_id_products_table_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products_table"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_factory_id_factories_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factories"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_client_id_customer_id_fkey" FOREIGN KEY ("client_id") REFERENCES "customer"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_exporter_id_exporters_id_fkey" FOREIGN KEY ("exporter_id") REFERENCES "exporters"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "salesperson_affiliations" ADD CONSTRAINT "salesperson_affiliations_salesperson_id_salespersons_id_fkey" FOREIGN KEY ("salesperson_id") REFERENCES "salespersons"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "salesperson_affiliations" ADD CONSTRAINT "salesperson_affiliations_factory_id_factories_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factories"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "salesperson_affiliations" ADD CONSTRAINT "salesperson_affiliations_exporter_id_exporters_id_fkey" FOREIGN KEY ("exporter_id") REFERENCES "exporters"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "salespersons" ADD CONSTRAINT "salespersons_user_id_user_table_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_table"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_table_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_table"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "site_categories" ADD CONSTRAINT "site_categories_site_id_sites_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id");--> statement-breakpoint
ALTER TABLE "site_categories" ADD CONSTRAINT "site_categories_master_category_id_master_categories_id_fkey" FOREIGN KEY ("master_category_id") REFERENCES "master_categories"("id");--> statement-breakpoint
ALTER TABLE "site_config" ADD CONSTRAINT "site_config_site_id_sites_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "site_products" ADD CONSTRAINT "site_products_site_id_sites_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id");--> statement-breakpoint
ALTER TABLE "site_products" ADD CONSTRAINT "site_products_product_id_products_table_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products_table"("id");--> statement-breakpoint
ALTER TABLE "site_products" ADD CONSTRAINT "site_products_site_category_id_site_categories_id_fkey" FOREIGN KEY ("site_category_id") REFERENCES "site_categories"("id");--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_factory_id_factories_id_fkey" FOREIGN KEY ("factory_id") REFERENCES "factories"("id");--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_exporter_id_exporters_id_fkey" FOREIGN KEY ("exporter_id") REFERENCES "exporters"("id");--> statement-breakpoint
ALTER TABLE "skus_table" ADD CONSTRAINT "skus_table_image_id_media_id_fkey" FOREIGN KEY ("image_id") REFERENCES "media"("id");--> statement-breakpoint
ALTER TABLE "user_site_roles" ADD CONSTRAINT "user_site_roles_user_id_user_table_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_table"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_site_roles" ADD CONSTRAINT "user_site_roles_site_id_sites_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_site_roles" ADD CONSTRAINT "user_site_roles_role_id_roles_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT;