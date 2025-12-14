-- 权限系统初始化 SQL
-- 包含角色和权限的基础数据

-- 1. 插入权限数据
INSERT INTO permissions (id, name, description, created_at, updated_at) VALUES
-- 用户管理权限
('550e8400-e29b-41d4-a716-446655440001', 'view_users', '查看用户列表', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'create_users', '创建新用户', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'edit_users', '编辑用户信息', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'delete_users', '删除用户', NOW(), NOW()),

-- 工厂管理权限
('550e8400-e29b-41d4-a716-446655440005', 'view_factories', '查看工厂列表', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'create_factories', '创建新工厂', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'edit_factories', '编辑工厂信息', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'delete_factories', '删除工厂', NOW(), NOW()),

-- 商品管理权限
('550e8400-e29b-41d4-a716-446655440009', 'view_products', '查看商品列表', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440010', 'create_products', '创建新商品', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440011', 'edit_products', '编辑商品信息', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'delete_products', '删除商品', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', 'publish_products', '发布商品', NOW(), NOW()),

-- 媒体管理权限
('550e8400-e29b-41d4-a716-446655440014', 'view_media', '查看媒体文件', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440015', 'upload_media', '上传媒体文件', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440016', 'delete_media', '删除媒体文件', NOW(), NOW()),

-- 订单管理权限
('550e8400-e29b-41d4-a716-446655440017', 'view_orders', '查看订单列表', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440018', 'process_orders', '处理订单', NOW(), NOW()),

-- 统计报表权限
('550e8400-e29b-41d4-a716-446655440019', 'view_analytics', '查看统计报表', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440020', 'export_reports', '导出报表', NOW(), NOW()),

-- 系统配置权限
('550e8400-e29b-41d4-a716-446655440021', 'view_site_config', '查看站点配置', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440022', 'edit_site_config', '编辑站点配置', NOW(), NOW()),

-- 分类管理权限
('550e8400-e29b-41d4-a716-446655440023', 'view_categories', '查看分类列表', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440024', 'edit_categories', '编辑分类', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440025', 'assign_categories', '分配商品分类', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. 插入角色数据
INSERT INTO roles (id, name, description, created_at, updated_at) VALUES
-- 注意：这里的 name 字段应该和 permissions.t.model.ts 中的 UserRole 类型保持一致
('660e8400-e29b-41d4-a716-446655440001', 'exporter_admin', '出口商管理员', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'factory_admin', '工厂管理员', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'salesperson', '业务员', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. 分配权限给角色
-- 出口商管理员权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'exporter_admin'
AND p.name IN (
    'view_users', 'create_users', 'edit_users', 'delete_users',
    'view_factories', 'create_factories', 'edit_factories', 'delete_factories',
    'view_products', 'create_products', 'edit_products', 'delete_products', 'publish_products',
    'view_media', 'upload_media', 'delete_media',
    'view_orders', 'process_orders',
    'view_analytics', 'export_reports',
    'view_site_config', 'edit_site_config',
    'view_categories', 'edit_categories', 'assign_categories'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 工厂管理员权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'factory_admin'
AND p.name IN (
    'view_users', 'create_users', 'edit_users',
    'view_factories', 'edit_factories',
    'view_products', 'create_products', 'edit_products', 'delete_products', 'publish_products',
    'view_media', 'upload_media', 'delete_media',
    'view_orders', 'process_orders',
    'view_analytics',
    'view_categories', 'assign_categories'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 业务员权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'salesperson'
AND p.name IN (
    'view_products', 'create_products', 'edit_products',
    'view_media', 'upload_media', 'delete_media',
    'view_orders'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 4. 创建默认超级管理员用户（可选）
-- 注意：请根据实际情况修改邮箱和密码
-- INSERT INTO users (id, name, email, email_verified, created_at, updated_at)
-- VALUES ('770e8400-e29b-41d4-a716-446655440001', '超级管理员', 'admin@example.com', true, NOW(), NOW())
-- ON CONFLICT (id) DO NOTHING;

-- 分配超级管理员角色
-- INSERT INTO user_roles (id, user_id, role_id)
-- SELECT
--     gen_random_uuid(),
--     u.id,
--     r.id
-- FROM users u
-- CROSS JOIN roles r
-- WHERE u.email = 'admin@example.com'
-- AND r.name = 'exporter_admin'
-- ON CONFLICT DO NOTHING;