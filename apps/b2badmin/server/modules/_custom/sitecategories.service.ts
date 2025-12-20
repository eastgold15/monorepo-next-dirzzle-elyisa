/**
 * ✍️ 【B2B Service - 业务自定义】
 * --------------------------------------------------------
 * 💡 你可以在此重写基类方法或添加私有业务逻辑。
 * 🛡️ 自动化脚本永远不会覆盖此文件。
 * --------------------------------------------------------
 */
import {
  type ExtractTablesWithRelations,
  eq,
  type Many,
  type One,
  sql,
} from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgColumn, PgTableWithColumns } from "drizzle-orm/pg-core";
import { HttpError } from "elysia-http-problem-json";
import type { Pool } from "pg";
import { SiteCategoriesGeneratedService } from "../_generated/sitecategories.service";
import type { ServiceContext } from "../_lib/base-service";

export class SiteCategoriesService extends SiteCategoriesGeneratedService {
  findOne(
    id: string,
    arg1: {
      db: NodePgDatabase<
        Record<string, never>,
        ExtractTablesWithRelations<
          {
            usersTable: {
              siteRoles: Many<"userSiteRolesTable">;
              accounts: Many<"accountTable">;
              sessions: Many<"sessionTable">;
              salesperson: One<"salespersonsTable", true>;
              userSiteRoles: One<"userSiteRolesTable", true>;
            };
            userSiteRolesTable: {
              user: One<"usersTable", true>;
              site: One<"sitesTable", false>;
              role: One<"roleTable", false>;
            };
            roleTable: {
              userSiteRoles: Many<"userSiteRolesTable">;
              Permissions: Many<"permissionTable">;
              parentRole: One<"roleTable", true>;
            };
            rolePermissionsTable: {
              role: One<"roleTable", false>;
              permission: One<"permissionTable", false>;
            };
            permissionTable: { roles: Many<"roleTable"> };
            exportersTable: {
              factories: Many<"factoriesTable">;
              quotations: Many<"quotationsTable">;
              sites: Many<"sitesTable">;
            };
            factoriesTable: {
              exporter: One<"exportersTable", true>;
              sites: Many<"sitesTable">;
            };
            masterTable: {
              parent: One<"masterTable", true>;
              children: Many<"masterTable">;
              attributeTemplates: Many<"attributeTemplateTable">;
              siteCategories: Many<"siteCategoriesTable">;
            };
            sitesTable: {
              exporterOwner: One<"exportersTable", true>;
              factoryOwner: One<"factoriesTable", true>;
              userSiteRoles: Many<"userSiteRolesTable">;
              siteCategories: Many<"siteCategoriesTable">;
              siteProducts: Many<"siteProductsTable">;
              ads: Many<"adsTable">;
              heroCards: Many<"heroCardsTable">;
              siteConfig: Many<"siteConfigTable">;
              inquiries: Many<"inquiryTable">;
            };
            siteProductsTable: {
              site: One<"sitesTable", true>;
              product: One<"productsTable", true>;
              siteCategory: One<"siteCategoriesTable", true>;
            };
            siteCategoriesTable: {
              site: One<"sitesTable", true>;
              parent: One<"siteCategoriesTable", true>;
              children: Many<"siteCategoriesTable">;
              globalCategory: One<"masterTable", true>;
              siteProducts: Many<"siteProductsTable">;
            };
            productsTable: {
              siteProducts: Many<"siteProductsTable">;
              productMedia: Many<"productMediaTable">;
              skus: Many<"skusTable">;
              productTemplate: One<"productTemplateTable", true>;
              quotationItems: Many<"quotationItemsTable">;
            };
            inquiryTable: {
              items: Many<"inquiryItemsTable">;
              site: One<"sitesTable", true>;
            };
            adsTable: {
              site: One<"sitesTable", true>;
              media: One<"mediaTable", true>;
            };
            heroCardsTable: {
              site: One<"sitesTable", true>;
              media: One<"mediaTable", true>;
            };
            siteConfigTable: { site: One<"sitesTable", true> };
            salespersonsTable: {
              user: One<"usersTable", true>;
              affiliations: Many<"salespersonAffiliationsTable">;
            };
            salespersonAffiliationsTable: {
              salesperson: One<"salespersonsTable", true>;
              factory: One<"factoriesTable", true>;
              exporter: One<"exportersTable", true>;
            };
            mediaTable: {
              metadata: One<"mediaMetadataTable", true>;
              ads: Many<"adsTable">;
              heroCards: Many<"heroCardsTable">;
              productMedia: Many<"productMediaTable">;
              skuMedia: One<"skuMediaTable", true>;
            };
            mediaMetadataTable: { media: One<"mediaTable", true> };
            productCategoriesTable: {};
            productMediaTable: {
              product: One<"productsTable", true>;
              media: One<"mediaTable", true>;
            };
            attributeTemplateTable: {
              category: One<"masterTable", true>;
              attributes: Many<"attributeTable">;
              productTemplates: Many<"productTemplateTable">;
            };
            attributeTable: {
              template: One<"attributeTemplateTable", true>;
              values: Many<"attributeValueTable">;
            };
            attributeValueTable: { attribute: One<"attributeTable", true> };
            productTemplateTable: {
              product: One<"productsTable", true>;
              template: One<"attributeTemplateTable", true>;
            };
            skusTable: {
              product: One<"productsTable", true>;
              media: Many<"mediaTable">;
              inquiryItems: Many<"inquiryItemsTable">;
            };
            inquiryItemsTable: {
              inquiry: One<"inquiryTable", true>;
              sku: One<"skusTable", true>;
            };
            quotationsTable: {
              client: One<"CustomerTable", true>;
              exporter: One<"exportersTable", true>;
              items: Many<"quotationItemsTable">;
            };
            quotationItemsTable: {
              quotation: One<"quotationsTable", true>;
              product: One<"productsTable", true>;
              factory: One<"factoriesTable", true>;
            };
            CustomerTable: { quotations: Many<"quotationsTable"> };
            accountTable: { user: One<"usersTable", true> };
            sessionTable: { user: One<"usersTable", true> };
          },
          {
            readonly usersTable: PgTableWithColumns<{
              name: "user_table";
              schema: undefined;
              columns: {
                name: PgColumn<
                  {
                    name: string;
                    tableName: "user_table";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                email: PgColumn<
                  {
                    name: string;
                    tableName: "user_table";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                emailVerified: PgColumn<
                  {
                    name: string;
                    tableName: "user_table";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                image: PgColumn<
                  {
                    name: string;
                    tableName: "user_table";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isSuperAdmin: PgColumn<
                  {
                    name: string;
                    tableName: "user_table";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isActive: PgColumn<
                  {
                    name: string;
                    tableName: "user_table";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                phone: PgColumn<
                  {
                    name: string;
                    tableName: "user_table";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                address: PgColumn<
                  {
                    name: string;
                    tableName: "user_table";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                city: PgColumn<
                  {
                    name: string;
                    tableName: "user_table";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "user_table";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "user_table";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "user_table";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly accountTable: PgTableWithColumns<{
              name: "account";
              schema: undefined;
              columns: {
                accountId: PgColumn<
                  {
                    name: string;
                    tableName: "account";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                providerId: PgColumn<
                  {
                    name: string;
                    tableName: "account";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                userId: PgColumn<
                  {
                    name: string;
                    tableName: "account";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                accessToken: PgColumn<
                  {
                    name: string;
                    tableName: "account";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                refreshToken: PgColumn<
                  {
                    name: string;
                    tableName: "account";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                idToken: PgColumn<
                  {
                    name: string;
                    tableName: "account";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                accessTokenExpiresAt: PgColumn<
                  {
                    name: string;
                    tableName: "account";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                refreshTokenExpiresAt: PgColumn<
                  {
                    name: string;
                    tableName: "account";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                scope: PgColumn<
                  {
                    name: string;
                    tableName: "account";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                password: PgColumn<
                  {
                    name: string;
                    tableName: "account";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "account";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "account";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "account";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly sessionTable: PgTableWithColumns<{
              name: "session";
              schema: undefined;
              columns: {
                expiresAt: PgColumn<
                  {
                    name: string;
                    tableName: "session";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                token: PgColumn<
                  {
                    name: string;
                    tableName: "session";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                ipAddress: PgColumn<
                  {
                    name: string;
                    tableName: "session";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                userAgent: PgColumn<
                  {
                    name: string;
                    tableName: "session";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                userId: PgColumn<
                  {
                    name: string;
                    tableName: "session";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "session";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "session";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "session";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly verificationTable: PgTableWithColumns<{
              name: "verification";
              schema: undefined;
              columns: {
                identifier: PgColumn<
                  {
                    name: string;
                    tableName: "verification";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                value: PgColumn<
                  {
                    name: string;
                    tableName: "verification";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                expiresAt: PgColumn<
                  {
                    name: string;
                    tableName: "verification";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "verification";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "verification";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "verification";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly roleTable: PgTableWithColumns<{
              name: "roles";
              schema: undefined;
              columns: {
                id: PgColumn<
                  {
                    name: string;
                    tableName: "roles";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                name: PgColumn<
                  {
                    name: string;
                    tableName: "roles";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                description: PgColumn<
                  {
                    name: string;
                    tableName: "roles";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                type: PgColumn<
                  {
                    name: string;
                    tableName: "roles";
                    dataType: "string enum";
                    data: "custom" | "system";
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["system", "custom"];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                priority: PgColumn<
                  {
                    name: string;
                    tableName: "roles";
                    dataType: "number int32";
                    data: number;
                    driverParam: string | number;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                parentRoleId: PgColumn<
                  {
                    name: string;
                    tableName: "roles";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly permissionTable: PgTableWithColumns<{
              name: "permissions";
              schema: undefined;
              columns: {
                name: PgColumn<
                  {
                    name: string;
                    tableName: "permissions";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                description: PgColumn<
                  {
                    name: string;
                    tableName: "permissions";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "permissions";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "permissions";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "permissions";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly rolePermissionsTable: PgTableWithColumns<{
              name: "role_permissions";
              schema: undefined;
              columns: {
                roleId: PgColumn<
                  {
                    name: string;
                    tableName: "role_permissions";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                permissionId: PgColumn<
                  {
                    name: string;
                    tableName: "role_permissions";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly userSiteRolesTable: PgTableWithColumns<{
              name: "user_site_roles";
              schema: undefined;
              columns: {
                userId: PgColumn<
                  {
                    name: string;
                    tableName: "user_site_roles";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                siteId: PgColumn<
                  {
                    name: string;
                    tableName: "user_site_roles";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                roleId: PgColumn<
                  {
                    name: string;
                    tableName: "user_site_roles";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "user_site_roles";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly exportersTable: PgTableWithColumns<{
              name: "exporters";
              schema: undefined;
              columns: {
                name: PgColumn<
                  {
                    name: string;
                    tableName: "exporters";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                code: PgColumn<
                  {
                    name: string;
                    tableName: "exporters";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                address: PgColumn<
                  {
                    name: string;
                    tableName: "exporters";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                website: PgColumn<
                  {
                    name: string;
                    tableName: "exporters";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                bankInfo: PgColumn<
                  {
                    name: string;
                    tableName: "exporters";
                    dataType: "object json";
                    data: { beneficiary: string; accountNo: string };
                    driverParam: unknown;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isActive: PgColumn<
                  {
                    name: string;
                    tableName: "exporters";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isVerified: PgColumn<
                  {
                    name: string;
                    tableName: "exporters";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "exporters";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "exporters";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "exporters";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly masterTable: PgTableWithColumns<{
              name: "master_categories";
              schema: undefined;
              columns: {
                id: PgColumn<
                  {
                    name: string;
                    tableName: "master_categories";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                name: PgColumn<
                  {
                    name: string;
                    tableName: "master_categories";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                slug: PgColumn<
                  {
                    name: string;
                    tableName: "master_categories";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                description: PgColumn<
                  {
                    name: string;
                    tableName: "master_categories";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                parentId: PgColumn<
                  {
                    name: string;
                    tableName: "master_categories";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                sortOrder: PgColumn<
                  {
                    name: string;
                    tableName: "master_categories";
                    dataType: "number int32";
                    data: number;
                    driverParam: string | number;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isVisible: PgColumn<
                  {
                    name: string;
                    tableName: "master_categories";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                icon: PgColumn<
                  {
                    name: string;
                    tableName: "master_categories";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "master_categories";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "master_categories";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly factoriesTable: PgTableWithColumns<{
              name: "factories";
              schema: undefined;
              columns: {
                name: PgColumn<
                  {
                    name: string;
                    tableName: "factories";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                code: PgColumn<
                  {
                    name: string;
                    tableName: "factories";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                description: PgColumn<
                  {
                    name: string;
                    tableName: "factories";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                website: PgColumn<
                  {
                    name: string;
                    tableName: "factories";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                address: PgColumn<
                  {
                    name: string;
                    tableName: "factories";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                contactPhone: PgColumn<
                  {
                    name: string;
                    tableName: "factories";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                logo: PgColumn<
                  {
                    name: string;
                    tableName: "factories";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                exporterId: PgColumn<
                  {
                    name: string;
                    tableName: "factories";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isActive: PgColumn<
                  {
                    name: string;
                    tableName: "factories";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isVerified: PgColumn<
                  {
                    name: string;
                    tableName: "factories";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                businessLicense: PgColumn<
                  {
                    name: string;
                    tableName: "factories";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                mainProducts: PgColumn<
                  {
                    name: string;
                    tableName: "factories";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                annualRevenue: PgColumn<
                  {
                    name: string;
                    tableName: "factories";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                employeeCount: PgColumn<
                  {
                    name: string;
                    tableName: "factories";
                    dataType: "number int32";
                    data: number;
                    driverParam: string | number;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "factories";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "factories";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "factories";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly salespersonsTable: PgTableWithColumns<{
              name: "salespersons";
              schema: undefined;
              columns: {
                userId: PgColumn<
                  {
                    name: string;
                    tableName: "salespersons";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                phone: PgColumn<
                  {
                    name: string;
                    tableName: "salespersons";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                whatsapp: PgColumn<
                  {
                    name: string;
                    tableName: "salespersons";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                position: PgColumn<
                  {
                    name: string;
                    tableName: "salespersons";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                department: PgColumn<
                  {
                    name: string;
                    tableName: "salespersons";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isActive: PgColumn<
                  {
                    name: string;
                    tableName: "salespersons";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                avatar: PgColumn<
                  {
                    name: string;
                    tableName: "salespersons";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                lastAssignedAt: PgColumn<
                  {
                    name: string;
                    tableName: "salespersons";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "salespersons";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "salespersons";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "salespersons";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly salespersonAffiliationsTable: PgTableWithColumns<{
              name: "salesperson_affiliations";
              schema: undefined;
              columns: {
                salespersonId: PgColumn<
                  {
                    name: string;
                    tableName: "salesperson_affiliations";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                factoryId: PgColumn<
                  {
                    name: string;
                    tableName: "salesperson_affiliations";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                exporterId: PgColumn<
                  {
                    name: string;
                    tableName: "salesperson_affiliations";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                entityType: PgColumn<
                  {
                    name: string;
                    tableName: "salesperson_affiliations";
                    dataType: "string enum";
                    data: "exporter" | "factory";
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["exporter", "factory"];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "salesperson_affiliations";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "salesperson_affiliations";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "salesperson_affiliations";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly salespersonCategoriesTable: PgTableWithColumns<{
              name: "salesperson_categories";
              schema: undefined;
              columns: {
                salespersonId: PgColumn<
                  {
                    name: string;
                    tableName: "salesperson_categories";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                categoryId: PgColumn<
                  {
                    name: string;
                    tableName: "salesperson_categories";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly mediaTable: PgTableWithColumns<{
              name: "media";
              schema: undefined;
              columns: {
                siteId: PgColumn<
                  {
                    name: string;
                    tableName: "media";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                exporterId: PgColumn<
                  {
                    name: string;
                    tableName: "media";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                factoryId: PgColumn<
                  {
                    name: string;
                    tableName: "media";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                ownerId: PgColumn<
                  {
                    name: string;
                    tableName: "media";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isPublic: PgColumn<
                  {
                    name: string;
                    tableName: "media";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                storageKey: PgColumn<
                  {
                    name: string;
                    tableName: "media";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                category: PgColumn<
                  {
                    name: string;
                    tableName: "media";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                url: PgColumn<
                  {
                    name: string;
                    tableName: "media";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                originalName: PgColumn<
                  {
                    name: string;
                    tableName: "media";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                mimeType: PgColumn<
                  {
                    name: string;
                    tableName: "media";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                status: PgColumn<
                  {
                    name: string;
                    tableName: "media";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "media";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "media";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "media";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly mediaMetadataTable: PgTableWithColumns<{
              name: "media_metadata";
              schema: undefined;
              columns: {
                id: PgColumn<
                  {
                    name: string;
                    tableName: "media_metadata";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                fileId: PgColumn<
                  {
                    name: string;
                    tableName: "media_metadata";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                mediaType: PgColumn<
                  {
                    name: string;
                    tableName: "media_metadata";
                    dataType: "string enum";
                    data: "image" | "video" | "document" | "audio" | "other";
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [
                      "image",
                      "video",
                      "document",
                      "audio",
                      "other",
                    ];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                width: PgColumn<
                  {
                    name: string;
                    tableName: "media_metadata";
                    dataType: "number int32";
                    data: number;
                    driverParam: string | number;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                height: PgColumn<
                  {
                    name: string;
                    tableName: "media_metadata";
                    dataType: "number int32";
                    data: number;
                    driverParam: string | number;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                duration: PgColumn<
                  {
                    name: string;
                    tableName: "media_metadata";
                    dataType: "number int32";
                    data: number;
                    driverParam: string | number;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                metadataJson: PgColumn<
                  {
                    name: string;
                    tableName: "media_metadata";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                thumbnailKey: PgColumn<
                  {
                    name: string;
                    tableName: "media_metadata";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly adsTable: PgTableWithColumns<{
              name: "advertisements";
              schema: undefined;
              columns: {
                title: PgColumn<
                  {
                    name: string;
                    tableName: "advertisements";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                description: PgColumn<
                  {
                    name: string;
                    tableName: "advertisements";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                type: PgColumn<
                  {
                    name: string;
                    tableName: "advertisements";
                    dataType: "string enum";
                    data: "banner" | "carousel" | "list";
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["banner", "carousel", "list"];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                mediaId: PgColumn<
                  {
                    name: string;
                    tableName: "advertisements";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                link: PgColumn<
                  {
                    name: string;
                    tableName: "advertisements";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                position: PgColumn<
                  {
                    name: string;
                    tableName: "advertisements";
                    dataType: "string enum";
                    data: "home-top" | "home-middle" | "sidebar";
                    driverParam: string;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["home-top", "home-middle", "sidebar"];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                sortOrder: PgColumn<
                  {
                    name: string;
                    tableName: "advertisements";
                    dataType: "number int32";
                    data: number;
                    driverParam: string | number;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isActive: PgColumn<
                  {
                    name: string;
                    tableName: "advertisements";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                startDate: PgColumn<
                  {
                    name: string;
                    tableName: "advertisements";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                endDate: PgColumn<
                  {
                    name: string;
                    tableName: "advertisements";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                siteId: PgColumn<
                  {
                    name: string;
                    tableName: "advertisements";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "advertisements";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "advertisements";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "advertisements";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly heroCardsTable: PgTableWithColumns<{
              name: "hero_cards";
              schema: undefined;
              columns: {
                title: PgColumn<
                  {
                    name: string;
                    tableName: "hero_cards";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                description: PgColumn<
                  {
                    name: string;
                    tableName: "hero_cards";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                buttonText: PgColumn<
                  {
                    name: string;
                    tableName: "hero_cards";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                buttonUrl: PgColumn<
                  {
                    name: string;
                    tableName: "hero_cards";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                backgroundClass: PgColumn<
                  {
                    name: string;
                    tableName: "hero_cards";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                sortOrder: PgColumn<
                  {
                    name: string;
                    tableName: "hero_cards";
                    dataType: "number int32";
                    data: number;
                    driverParam: string | number;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isActive: PgColumn<
                  {
                    name: string;
                    tableName: "hero_cards";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                mediaId: PgColumn<
                  {
                    name: string;
                    tableName: "hero_cards";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                siteId: PgColumn<
                  {
                    name: string;
                    tableName: "hero_cards";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "hero_cards";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "hero_cards";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "hero_cards";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly productsTable: PgTableWithColumns<{
              name: "products_table";
              schema: undefined;
              columns: {
                exporterId: PgColumn<
                  {
                    name: string;
                    tableName: "products_table";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                factoryId: PgColumn<
                  {
                    name: string;
                    tableName: "products_table";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                ownerId: PgColumn<
                  {
                    name: string;
                    tableName: "products_table";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isPublic: PgColumn<
                  {
                    name: string;
                    tableName: "products_table";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                spuCode: PgColumn<
                  {
                    name: string;
                    tableName: "products_table";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                name: PgColumn<
                  {
                    name: string;
                    tableName: "products_table";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                description: PgColumn<
                  {
                    name: string;
                    tableName: "products_table";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                status: PgColumn<
                  {
                    name: string;
                    tableName: "products_table";
                    dataType: "number int32";
                    data: number;
                    driverParam: string | number;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                units: PgColumn<
                  {
                    name: string;
                    tableName: "products_table";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "products_table";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "products_table";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "products_table";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly productMasterCategoriesTable: PgTableWithColumns<{
              name: "product_categories";
              schema: undefined;
              columns: {
                productId: PgColumn<
                  {
                    name: string;
                    tableName: "product_categories";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                categoryId: PgColumn<
                  {
                    name: string;
                    tableName: "product_categories";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly productMediaTable: PgTableWithColumns<{
              name: "product_media";
              schema: undefined;
              columns: {
                productId: PgColumn<
                  {
                    name: string;
                    tableName: "product_media";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                mediaId: PgColumn<
                  {
                    name: string;
                    tableName: "product_media";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isMain: PgColumn<
                  {
                    name: string;
                    tableName: "product_media";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly attributeTemplateTable: PgTableWithColumns<{
              name: "attribute_templates";
              schema: undefined;
              columns: {
                id: PgColumn<
                  {
                    name: string;
                    tableName: "attribute_templates";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                name: PgColumn<
                  {
                    name: string;
                    tableName: "attribute_templates";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                categoryId: PgColumn<
                  {
                    name: string;
                    tableName: "attribute_templates";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly attributeTable: PgTableWithColumns<{
              name: "attributes_table";
              schema: undefined;
              columns: {
                id: PgColumn<
                  {
                    name: string;
                    tableName: "attributes_table";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                templateId: PgColumn<
                  {
                    name: string;
                    tableName: "attributes_table";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                name: PgColumn<
                  {
                    name: string;
                    tableName: "attributes_table";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                code: PgColumn<
                  {
                    name: string;
                    tableName: "attributes_table";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                inputType: PgColumn<
                  {
                    name: string;
                    tableName: "attributes_table";
                    dataType: "string enum";
                    data:
                      | "number"
                      | "select"
                      | "text"
                      | "multiselect"
                      | "richtext";
                    driverParam: string;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [
                      "select",
                      "text",
                      "number",
                      "multiselect",
                      "richtext",
                    ];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isRequired: PgColumn<
                  {
                    name: string;
                    tableName: "attributes_table";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isSaleAttr: PgColumn<
                  {
                    name: string;
                    tableName: "attributes_table";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                sortOrder: PgColumn<
                  {
                    name: string;
                    tableName: "attributes_table";
                    dataType: "number int32";
                    data: number;
                    driverParam: string | number;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly attributeValueTable: PgTableWithColumns<{
              name: "attribute_values_table";
              schema: undefined;
              columns: {
                id: PgColumn<
                  {
                    name: string;
                    tableName: "attribute_values_table";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                attributeId: PgColumn<
                  {
                    name: string;
                    tableName: "attribute_values_table";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                value: PgColumn<
                  {
                    name: string;
                    tableName: "attribute_values_table";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                sortOrder: PgColumn<
                  {
                    name: string;
                    tableName: "attribute_values_table";
                    dataType: "number int32";
                    data: number;
                    driverParam: string | number;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly productTemplateTable: PgTableWithColumns<{
              name: "product_template_table";
              schema: undefined;
              columns: {
                productId: PgColumn<
                  {
                    name: string;
                    tableName: "product_template_table";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                templateId: PgColumn<
                  {
                    name: string;
                    tableName: "product_template_table";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly skusTable: PgTableWithColumns<{
              name: "skus_table";
              schema: undefined;
              columns: {
                exporterId: PgColumn<
                  {
                    name: string;
                    tableName: "skus_table";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                factoryId: PgColumn<
                  {
                    name: string;
                    tableName: "skus_table";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                ownerId: PgColumn<
                  {
                    name: string;
                    tableName: "skus_table";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isPublic: PgColumn<
                  {
                    name: string;
                    tableName: "skus_table";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                skuCode: PgColumn<
                  {
                    name: string;
                    tableName: "skus_table";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                price: PgColumn<
                  {
                    name: string;
                    tableName: "skus_table";
                    dataType: "string numeric";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                marketPrice: PgColumn<
                  {
                    name: string;
                    tableName: "skus_table";
                    dataType: "string numeric";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                costPrice: PgColumn<
                  {
                    name: string;
                    tableName: "skus_table";
                    dataType: "string numeric";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                weight: PgColumn<
                  {
                    name: string;
                    tableName: "skus_table";
                    dataType: "string numeric";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                volume: PgColumn<
                  {
                    name: string;
                    tableName: "skus_table";
                    dataType: "string numeric";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                stock: PgColumn<
                  {
                    name: string;
                    tableName: "skus_table";
                    dataType: "string numeric";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                specJson: PgColumn<
                  {
                    name: string;
                    tableName: "skus_table";
                    dataType: "object json";
                    data: unknown;
                    driverParam: unknown;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                extraAttributes: PgColumn<
                  {
                    name: string;
                    tableName: "skus_table";
                    dataType: "object json";
                    data: unknown;
                    driverParam: unknown;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                status: PgColumn<
                  {
                    name: string;
                    tableName: "skus_table";
                    dataType: "number int32";
                    data: number;
                    driverParam: string | number;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                productId: PgColumn<
                  {
                    name: string;
                    tableName: "skus_table";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "skus_table";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "skus_table";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "skus_table";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly skuMediaTable: PgTableWithColumns<{
              name: "sku_media";
              schema: undefined;
              columns: {
                exporterId: PgColumn<
                  {
                    name: string;
                    tableName: "sku_media";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                factoryId: PgColumn<
                  {
                    name: string;
                    tableName: "sku_media";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                ownerId: PgColumn<
                  {
                    name: string;
                    tableName: "sku_media";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isPublic: PgColumn<
                  {
                    name: string;
                    tableName: "sku_media";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                skuId: PgColumn<
                  {
                    name: string;
                    tableName: "sku_media";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                mediaId: PgColumn<
                  {
                    name: string;
                    tableName: "sku_media";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isMain: PgColumn<
                  {
                    name: string;
                    tableName: "sku_media";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                sortOrder: PgColumn<
                  {
                    name: string;
                    tableName: "sku_media";
                    dataType: "number int32";
                    data: number;
                    driverParam: string | number;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly CustomerTable: PgTableWithColumns<{
              name: "customer";
              schema: undefined;
              columns: {
                exporterId: PgColumn<
                  {
                    name: string;
                    tableName: "customer";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                factoryId: PgColumn<
                  {
                    name: string;
                    tableName: "customer";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                ownerId: PgColumn<
                  {
                    name: string;
                    tableName: "customer";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isPublic: PgColumn<
                  {
                    name: string;
                    tableName: "customer";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                companyName: PgColumn<
                  {
                    name: string;
                    tableName: "customer";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                name: PgColumn<
                  {
                    name: string;
                    tableName: "customer";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                email: PgColumn<
                  {
                    name: string;
                    tableName: "customer";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                whatsapp: PgColumn<
                  {
                    name: string;
                    tableName: "customer";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                phone: PgColumn<
                  {
                    name: string;
                    tableName: "customer";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                address: PgColumn<
                  {
                    name: string;
                    tableName: "customer";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "customer";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "customer";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "customer";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly inquiryTable: PgTableWithColumns<{
              name: "inquiries";
              schema: undefined;
              columns: {
                exporterId: PgColumn<
                  {
                    name: string;
                    tableName: "inquiries";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                factoryId: PgColumn<
                  {
                    name: string;
                    tableName: "inquiries";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                ownerId: PgColumn<
                  {
                    name: string;
                    tableName: "inquiries";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isPublic: PgColumn<
                  {
                    name: string;
                    tableName: "inquiries";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                customerName: PgColumn<
                  {
                    name: string;
                    tableName: "inquiries";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                customerCompany: PgColumn<
                  {
                    name: string;
                    tableName: "inquiries";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                customerEmail: PgColumn<
                  {
                    name: string;
                    tableName: "inquiries";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                customerPhone: PgColumn<
                  {
                    name: string;
                    tableName: "inquiries";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                customerWhatsapp: PgColumn<
                  {
                    name: string;
                    tableName: "inquiries";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                status: PgColumn<
                  {
                    name: string;
                    tableName: "inquiries";
                    dataType: "string enum";
                    data:
                      | "pending"
                      | "quoted"
                      | "sent"
                      | "completed"
                      | "cancelled";
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [
                      "pending",
                      "quoted",
                      "sent",
                      "completed",
                      "cancelled",
                    ];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                siteId: PgColumn<
                  {
                    name: string;
                    tableName: "inquiries";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "inquiries";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "inquiries";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "inquiries";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly inquiryItemsTable: PgTableWithColumns<{
              name: "inquiry_items";
              schema: undefined;
              columns: {
                inquiryId: PgColumn<
                  {
                    name: string;
                    tableName: "inquiry_items";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                skuId: PgColumn<
                  {
                    name: string;
                    tableName: "inquiry_items";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                productName: PgColumn<
                  {
                    name: string;
                    tableName: "inquiry_items";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                productDescription: PgColumn<
                  {
                    name: string;
                    tableName: "inquiry_items";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                skuQuantity: PgColumn<
                  {
                    name: string;
                    tableName: "inquiry_items";
                    dataType: "number int32";
                    data: number;
                    driverParam: string | number;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                skuPrice: PgColumn<
                  {
                    name: string;
                    tableName: "inquiry_items";
                    dataType: "string numeric";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                paymentMethod: PgColumn<
                  {
                    name: string;
                    tableName: "inquiry_items";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                customerRequirements: PgColumn<
                  {
                    name: string;
                    tableName: "inquiry_items";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "inquiry_items";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "inquiry_items";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "inquiry_items";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly quotationsTable: PgTableWithColumns<{
              name: "quotations";
              schema: undefined;
              columns: {
                exporterId: PgColumn<
                  {
                    name: string;
                    tableName: "quotations";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                factoryId: PgColumn<
                  {
                    name: string;
                    tableName: "quotations";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                ownerId: PgColumn<
                  {
                    name: string;
                    tableName: "quotations";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isPublic: PgColumn<
                  {
                    name: string;
                    tableName: "quotations";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                refNo: PgColumn<
                  {
                    name: string;
                    tableName: "quotations";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                date: PgColumn<
                  {
                    name: string;
                    tableName: "quotations";
                    dataType: "string date";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                clientId: PgColumn<
                  {
                    name: string;
                    tableName: "quotations";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                deliveryTimeDays: PgColumn<
                  {
                    name: string;
                    tableName: "quotations";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                sampleLeadtimeDays: PgColumn<
                  {
                    name: string;
                    tableName: "quotations";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                paymentTerms: PgColumn<
                  {
                    name: string;
                    tableName: "quotations";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                qualityRemark: PgColumn<
                  {
                    name: string;
                    tableName: "quotations";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                safetyCompliance: PgColumn<
                  {
                    name: string;
                    tableName: "quotations";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                status: PgColumn<
                  {
                    name: string;
                    tableName: "quotations";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "quotations";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "quotations";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "quotations";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly quotationItemsTable: PgTableWithColumns<{
              name: "quotation_items";
              schema: undefined;
              columns: {
                quotationId: PgColumn<
                  {
                    name: string;
                    tableName: "quotation_items";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                productId: PgColumn<
                  {
                    name: string;
                    tableName: "quotation_items";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                factoryId: PgColumn<
                  {
                    name: string;
                    tableName: "quotation_items";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                unitPriceUsd: PgColumn<
                  {
                    name: string;
                    tableName: "quotation_items";
                    dataType: "string numeric";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                quantity: PgColumn<
                  {
                    name: string;
                    tableName: "quotation_items";
                    dataType: "number int32";
                    data: number;
                    driverParam: string | number;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                totalUsd: PgColumn<
                  {
                    name: string;
                    tableName: "quotation_items";
                    dataType: "string numeric";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                remark: PgColumn<
                  {
                    name: string;
                    tableName: "quotation_items";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "quotation_items";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "quotation_items";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "quotation_items";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly siteConfigTable: PgTableWithColumns<{
              name: "site_config";
              schema: undefined;
              columns: {
                key: PgColumn<
                  {
                    name: string;
                    tableName: "site_config";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                value: PgColumn<
                  {
                    name: string;
                    tableName: "site_config";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                description: PgColumn<
                  {
                    name: string;
                    tableName: "site_config";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                category: PgColumn<
                  {
                    name: string;
                    tableName: "site_config";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                url: PgColumn<
                  {
                    name: string;
                    tableName: "site_config";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                translatable: PgColumn<
                  {
                    name: string;
                    tableName: "site_config";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                visible: PgColumn<
                  {
                    name: string;
                    tableName: "site_config";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                siteId: PgColumn<
                  {
                    name: string;
                    tableName: "site_config";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "site_config";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "site_config";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "site_config";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly dailyInquiryCounterTable: PgTableWithColumns<{
              name: "daily_inquiry_counter";
              schema: undefined;
              columns: {
                date: PgColumn<
                  {
                    name: string;
                    tableName: "daily_inquiry_counter";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                count: PgColumn<
                  {
                    name: string;
                    tableName: "daily_inquiry_counter";
                    dataType: "number int32";
                    data: number;
                    driverParam: string | number;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                lastResetAt: PgColumn<
                  {
                    name: string;
                    tableName: "daily_inquiry_counter";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "daily_inquiry_counter";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "daily_inquiry_counter";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "daily_inquiry_counter";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly translationDictTable: PgTableWithColumns<{
              name: "translation_dict";
              schema: undefined;
              columns: {
                key: PgColumn<
                  {
                    name: string;
                    tableName: "translation_dict";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                category: PgColumn<
                  {
                    name: string;
                    tableName: "translation_dict";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                description: PgColumn<
                  {
                    name: string;
                    tableName: "translation_dict";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                translations: PgColumn<
                  {
                    name: string;
                    tableName: "translation_dict";
                    dataType: "object json";
                    data: Record<string, any>;
                    driverParam: unknown;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isActive: PgColumn<
                  {
                    name: string;
                    tableName: "translation_dict";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                sortOrder: PgColumn<
                  {
                    name: string;
                    tableName: "translation_dict";
                    dataType: "number int32";
                    data: number;
                    driverParam: string | number;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "translation_dict";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "translation_dict";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "translation_dict";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly sitesTable: PgTableWithColumns<{
              name: "sites";
              schema: undefined;
              columns: {
                name: PgColumn<
                  {
                    name: string;
                    tableName: "sites";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                domain: PgColumn<
                  {
                    name: string;
                    tableName: "sites";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isActive: PgColumn<
                  {
                    name: string;
                    tableName: "sites";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                siteType: PgColumn<
                  {
                    name: string;
                    tableName: "sites";
                    dataType: "string enum";
                    data: "exporter" | "factory";
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: ["exporter", "factory"];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                factoryId: PgColumn<
                  {
                    name: string;
                    tableName: "sites";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                exporterId: PgColumn<
                  {
                    name: string;
                    tableName: "sites";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "sites";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "sites";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "sites";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly siteCategoriesTable: PgTableWithColumns<{
              name: "site_categories";
              schema: undefined;
              columns: {
                name: PgColumn<
                  {
                    name: string;
                    tableName: "site_categories";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                parentId: PgColumn<
                  {
                    name: string;
                    tableName: "site_categories";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                sortOrder: PgColumn<
                  {
                    name: string;
                    tableName: "site_categories";
                    dataType: "number int32";
                    data: number;
                    driverParam: string | number;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                siteId: PgColumn<
                  {
                    name: string;
                    tableName: "site_categories";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                masterCategoryId: PgColumn<
                  {
                    name: string;
                    tableName: "site_categories";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "site_categories";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "site_categories";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "site_categories";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
            readonly siteProductsTable: PgTableWithColumns<{
              name: "site_products";
              schema: undefined;
              columns: {
                sitePrice: PgColumn<
                  {
                    name: string;
                    tableName: "site_products";
                    dataType: "string numeric";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                siteName: PgColumn<
                  {
                    name: string;
                    tableName: "site_products";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                siteDescription: PgColumn<
                  {
                    name: string;
                    tableName: "site_products";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isFeatured: PgColumn<
                  {
                    name: string;
                    tableName: "site_products";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                sortOrder: PgColumn<
                  {
                    name: string;
                    tableName: "site_products";
                    dataType: "number int32";
                    data: number;
                    driverParam: string | number;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                isVisible: PgColumn<
                  {
                    name: string;
                    tableName: "site_products";
                    dataType: "boolean";
                    data: boolean;
                    driverParam: boolean;
                    notNull: false;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                seoTitle: PgColumn<
                  {
                    name: string;
                    tableName: "site_products";
                    dataType: "string";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: [string, ...string[]];
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                siteId: PgColumn<
                  {
                    name: string;
                    tableName: "site_products";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                productId: PgColumn<
                  {
                    name: string;
                    tableName: "site_products";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                siteCategoryId: PgColumn<
                  {
                    name: string;
                    tableName: "site_products";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: false;
                    hasDefault: false;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                id: PgColumn<
                  {
                    name: string;
                    tableName: "site_products";
                    dataType: "string uuid";
                    data: string;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: true;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                createdAt: PgColumn<
                  {
                    name: string;
                    tableName: "site_products";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
                updatedAt: PgColumn<
                  {
                    name: string;
                    tableName: "site_products";
                    dataType: "object date";
                    data: Date;
                    driverParam: string;
                    notNull: true;
                    hasDefault: true;
                    isPrimaryKey: false;
                    isAutoincrement: false;
                    hasRuntimeDefault: false;
                    enumValues: undefined;
                    baseColumn: never;
                    identity: undefined;
                    generated: undefined;
                  },
                  {}
                >;
              };
              dialect: "pg";
            }>;
          }
        >
      > & { $client: Pool };
      auth: {
        readonly role: string;
        readonly userId: string;
        readonly siteId: string;
        readonly factoryId: string | null;
        readonly exporterId: string | null;
        readonly tenantId: string;
      };
    }
  ): any {
    throw new Error("Method not implemented.");
  }
  /**
   * 🛡️ 核心：获取树形结构的分类列表
   */
  async getTree(ctx: ServiceContext) {
    const table = this.table as any;

    // 获取所有分类
    const categories = await this.withScope(
      ctx.db.select().from(this.table).$dynamic(),
      ctx,
      []
    ).orderBy(sql`${table.sortOrder} asc, ${table.createdAt} asc`);

    // 构建树形结构
    const categoryMap = new Map();
    const rootCategories = [];

    // 先将所有分类存入 map
    for (const category of categories) {
      categoryMap.set(category.id, {
        ...category,
        children: [],
      });
    }

    // 构建父子关系
    for (const category of categories) {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(categoryMap.get(category.id));
        }
      } else {
        rootCategories.push(categoryMap.get(category.id));
      }
    }

    return rootCategories;
  }

  /**
   * 🛡️ 核心：创建分类（支持层级关系）
   */
  async createCategory(data: any, ctx: ServiceContext) {
    const {
      name,
      description,
      parentId,
      sortOrder = 0,
      isActive = true,
    } = data;

    // 如果有父级，验证父级是否存在
    if (parentId) {
      const select = ctx.db.select().from(this.table).$dynamic();
      const [parent] = await this.withScope(select, ctx, [
        eq((this.table as any).id, parentId),
      ]);

      if (!parent) {
        throw new HttpError.NotFound("父级分类不存在或无权访问");
      }
    }

    return await this.create(
      {
        name,
        description,
        parentId,
        sortOrder,
        isActive,
      },
      ctx
    );
  }

  /**
   * 🛡️ 核心：移动分类（更新父级关系）
   */
  async moveCategory(
    id: string,
    newParentId: string | null,
    ctx: ServiceContext
  ) {
    const table = this.table as any;

    // 验证分类是否存在
    const select = ctx.db.select().from(this.table).$dynamic();
    const [category] = await this.withScope(select, ctx, [eq(table.id, id)]);

    if (!category) {
      throw new HttpError.NotFound("分类不存在或无权访问");
    }

    // 验证不能将分类移动到自己的子级下
    if (newParentId) {
      const [parent] = await this.withScope(select, ctx, [
        eq(table.id, newParentId),
      ]);

      if (!parent) {
        throw new HttpError.NotFound("目标父级分类不存在或无权访问");
      }

      // 检查是否会形成循环引用
      const isDescendant = await this.checkIsDescendant(newParentId, id, ctx);
      if (isDescendant) {
        throw new HttpError.BadRequest("不能将分类移动到自己的子级下");
      }
    }

    // 更新父级关系
    const [updated] = await this.withScope(
      ctx.db
        .update(table)
        .set({ parentId: newParentId })
        .where(eq(table.id, id))
        .returning(),
      ctx
    );

    return {
      id: updated.id,
      parentId: updated.parentId,
      message: "分类移动成功",
    };
  }

  /**
   * 🛡️ 核心：批量更新排序
   */
  async updateSortOrder(
    items: Array<{ id: string; sortOrder: number }>,
    ctx: ServiceContext
  ) {
    const table = this.table as any;

    // 使用事务处理批量排序更新
    await ctx.db.transaction(async (tx) => {
      for (const item of items) {
        // 使用 withScope 确保只能更新属于自己 Scope 的分类
        await this.withScope(
          tx.update(table).set({ sortOrder: item.sortOrder }),
          ctx,
          [eq(table.id, item.id)]
        );
      }
    });

    return { success: true, message: "排序更新成功" };
  }

  /**
   * 🛡️ 核心：切换激活状态
   */
  async toggleStatus(id: string, ctx: ServiceContext) {
    const table = this.table as any;
    const select = ctx.db.select().from(this.table).$dynamic();
    const [category] = await this.withScope(select, ctx, [eq(table.id, id)]);

    if (!category) {
      throw new HttpError.NotFound("分类不存在或无权访问");
    }

    const [updated] = await this.withScope(
      ctx.db
        .update(table)
        .set({ isActive: !category.isActive })
        .where(eq(table.id, id))
        .returning(),
      ctx
    );

    return {
      id: updated.id,
      isActive: updated.isActive,
      message: updated.isActive ? "分类已激活" : "分类已停用",
    };
  }

  /**
   * 🛡️ 辅助方法：检查是否为子孙分类
   */
  private async checkIsDescendant(
    ancestorId: string,
    descendantId: string,
    ctx: ServiceContext
  ): Promise<boolean> {
    const table = this.table as any;
    const select = ctx.db.select().from(this.table).$dynamic();
    const category = await this.withScope(select, ctx, [
      eq(table.id, descendantId),
    ]);

    if (!category || category.length === 0) {
      return false;
    }

    const parentId = category[0].parentId;

    if (!parentId) {
      return false;
    }

    if (parentId === ancestorId) {
      return true;
    }

    // 递归检查
    return await this.checkIsDescendant(ancestorId, parentId, ctx);
  }
}
