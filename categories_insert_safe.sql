-- 安全版本：使用子查询获取父分类ID，避免硬编码
-- 分类数据插入脚本（使用翻译键）

-- 先插入父分类
INSERT INTO categories (name, slug, description, parent_id, sort_order, is_visible, icon, created_at, updated_at) VALUES
-- 顶级分类
('category.new_arrivals', 'new-arrivals', 'description.new_arrivals', NULL, 1, true, 'pi pi-sparkles', NOW(), NOW()),
('category.handbags', 'handbags', 'description.handbags', NULL, 2, true, 'pi pi-shopping-bag', NOW(), NOW()),
('category.footwear', 'footwear', 'description.footwear', NULL, 3, true, 'pi pi-android', NOW(), NOW());

-- 插入鞋履子分类（使用子查询获取鞋履父分类的ID）
INSERT INTO categories (name, slug, description, parent_id, sort_order, is_visible, icon, created_at, updated_at)
SELECT
    'category.high_heels' as name,
    'high-heels' as slug,
    'description.high_heels' as description,
    id as parent_id,
    1 as sort_order,
    true as is_visible,
    'pi pi-sort-alt' as icon,
    NOW() as created_at,
    NOW() as updated_at
FROM categories
WHERE slug = 'footwear'
LIMIT 1;

INSERT INTO categories (name, slug, description, parent_id, sort_order, is_visible, icon, created_at, updated_at)
SELECT
    'category.sandals' as name,
    'sandals' as slug,
    'description.sandals' as description,
    id as parent_id,
    2 as sort_order,
    true as is_visible,
    'pi pi-sun' as icon,
    NOW() as created_at,
    NOW() as updated_at
FROM categories
WHERE slug = 'footwear'
LIMIT 1;

INSERT INTO categories (name, slug, description, parent_id, sort_order, is_visible, icon, created_at, updated_at)
SELECT
    'category.womens_boots' as name,
    'womens-boots' as slug,
    'description.womens_boots' as description,
    id as parent_id,
    3 as sort_order,
    true as is_visible,
    'pi pi-mobile' as icon,
    NOW() as created_at,
    NOW() as updated_at
FROM categories
WHERE slug = 'footwear'
LIMIT 1;

INSERT INTO categories (name, slug, description, parent_id, sort_order, is_visible, icon, created_at, updated_at)
SELECT
    'category.platform_high_heels' as name,
    'platform-high-heels' as slug,
    'description.platform_high_heels' as description,
    id as parent_id,
    4 as sort_order,
    true as is_visible,
    'pi pi-arrow-up' as icon,
    NOW() as created_at,
    NOW() as updated_at
FROM categories
WHERE slug = 'footwear'
LIMIT 1;

INSERT INTO categories (name, slug, description, parent_id, sort_order, is_visible, icon, created_at, updated_at)
SELECT
    'category.flat_shoes' as name,
    'flat-shoes' as slug,
    'description.flat_shoes' as description,
    id as parent_id,
    5 as sort_order,
    true as is_visible,
    'pi pi-minus' as icon,
    NOW() as created_at,
    NOW() as updated_at
FROM categories
WHERE slug = 'footwear'
LIMIT 1;

INSERT INTO categories (name, slug, description, parent_id, sort_order, is_visible, icon, created_at, updated_at)
SELECT
    'category.wedding_shoes' as name,
    'wedding-shoes' as slug,
    'description.wedding_shoes' as description,
    id as parent_id,
    6 as sort_order,
    true as is_visible,
    'pi pi-heart' as icon,
    NOW() as created_at,
    NOW() as updated_at
FROM categories
WHERE slug = 'footwear'
LIMIT 1;

-- 查询验证插入结果
SELECT
    c.id,
    c.name,
    c.slug,
    c.parent_id,
    p.name as parent_name,
    c.sort_order,
    c.is_visible,
    c.icon
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
ORDER BY c.parent_id NULLS FIRST, c.sort_order;