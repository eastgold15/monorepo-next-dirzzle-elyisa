-- Footer 配置数据初始化（包含 URL 字段）
-- Category: footer

-- 品牌信息
INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.brand.name', 'GINA', '品牌名称', 'footer', false, true, '');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.brand.slogan', '品质生活，从GINA开始', '品牌口号', 'footer', true, true, '');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.brand.intro', '我们致力于为您提供高品质的产品，让生活更加美好。每一件产品都经过精心挑选，确保为您带来最佳的体验。', '品牌介绍', 'footer', true, true, '');

-- 社交媒体链接（URL存储在url字段）
INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.social.facebook', 'Facebook', 'Facebook链接', 'footer', false, true, 'https://facebook.com/gina');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.social.instagram', 'Instagram', 'Instagram链接', 'footer', false, true, 'https://instagram.com/gina');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.social.twitter', 'Twitter', 'Twitter链接', 'footer', false, true, 'https://twitter.com/gina');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.social.linkedin', 'LinkedIn', 'LinkedIn链接', 'footer', false, true, 'https://linkedin.com/company/gina');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.social.youtube', 'YouTube', 'YouTube链接', 'footer', false, true, 'https://youtube.com/gina');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.social.wechat', '微信', '微信号', 'footer', false, true, '#');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.social.weibo', '微博', '微博链接', 'footer', false, true, 'https://weibo.com/gina');

-- 快速链接（value存储显示文本，url存储链接地址）
INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.quick_links.home', '首页', '首页链接', 'footer', false, true, '/');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.quick_links.products', '产品', '产品页面链接', 'footer', false, true, '/search');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.quick_links.about', '关于我们', '关于我们链接', 'footer', false, true, '/about');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.quick_links.contact', '联系我们', '联系我们链接', 'footer', false, true, '/contact');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.quick_links.blog', '博客', '博客链接', 'footer', false, true, '/blog');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.quick_links.help', '帮助中心', '帮助中心链接', 'footer', false, true, '/help');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.quick_links.privacy', '隐私政策', '隐私政策链接', 'footer', false, true, '/privacy');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.quick_links.terms', '服务条款', '服务条款链接', 'footer', false, true, '/terms');

-- 联系信息
INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.contact.address', '北京市朝阳区建国路88号SOHO现代城', '公司地址', 'footer', true, true, '');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.contact.phone', '+86 10 8888 8888', '联系电话', 'footer', false, true, '');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.contact.email', 'service@gina.com', '客服邮箱', 'footer', false, true, '');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.contact.workTime', '周一至周日 9:00-18:00', '工作时间', 'footer', true, true, '');

-- 版权信息
INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.copyright.text', '© 2024 GINA. 版权所有。', '版权文字', 'footer', true, true, '');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.copyright.icp', '京ICP备88888888号', 'ICP备案号', 'footer', false, true, '');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.copyright.police', '京公网安备 11010502088888号', '公安备案号', 'footer', false, true, '');

-- 支付方式（布尔值不需要翻译）
INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.payment.wechat', 'true', '支持微信支付', 'footer', false, true, '');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.payment.alipay', 'true', '支持支付宝', 'footer', false, true, '');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.payment.unionpay', 'true', '支持银联', 'footer', false, true, '');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.payment.visa', 'true', '支持Visa', 'footer', false, true, '');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.payment.mastercard', 'true', '支持MasterCard', 'footer', false, true, '');

-- 物流合作（布尔值不需要翻译）
INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.logistics.sf', 'true', '顺丰速运', 'footer', false, true, '');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.logistics.jd', 'true', '京东物流', 'footer', false, true, '');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.logistics.zto', 'true', '中通快递', 'footer', false, true, '');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.logistics.yto', 'true', '圆通速递', 'footer', false, true, '');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.logistics.sto', 'true', '申通快递', 'footer', false, true, '');

-- 客服支持（电话和邮箱不需要翻译）
INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.support.phone', '400-888-8888', '客服电话', 'footer', false, true, '');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.support.email', 'support@gina.com', '客服邮箱', 'footer', false, true, '');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.support.online', 'true', '在线客服', 'footer', false, true, '');

-- 应用下载（URL不需要翻译，默认隐藏）
INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.app.ios_url', 'iOS', 'iOS App Store链接', 'footer', false, false, 'https://apps.apple.com/app/gina');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.app.android_url', 'Android', 'Android应用链接', 'footer', false, false, 'https://play.google.com/store/apps/details?id=com.gina');

INSERT INTO site_config (key, value, description, category, translatable, visible, url) VALUES
('footer.app.qrcode', 'App QR Code', '应用下载二维码', 'footer', false, false, '/images/qrcode/app-download.png');

-- 更新冲突处理
-- 如果数据已存在，则更新新字段
UPDATE site_config SET
  translatable = CASE
    WHEN key = 'footer.brand.slogan' OR key = 'footer.brand.intro' THEN true
    WHEN key = 'footer.contact.address' OR key = 'footer.contact.work_time' THEN true
    WHEN key = 'footer.copyright.text' THEN true
    ELSE false
  END,
  visible = CASE
    WHEN key LIKE 'footer.app.%' THEN false
    ELSE true
  END,
  url = CASE
    WHEN key = 'footer.social.facebook' THEN 'https://facebook.com/gina'
    WHEN key = 'footer.social.instagram' THEN 'https://instagram.com/gina'
    WHEN key = 'footer.social.twitter' THEN 'https://twitter.com/gina'
    WHEN key = 'footer.social.linkedin' THEN 'https://linkedin.com/company/gina'
    WHEN key = 'footer.social.youtube' THEN 'https://youtube.com/gina'
    WHEN key = 'footer.social.wechat' THEN '#'
    WHEN key = 'footer.social.weibo' THEN 'https://weibo.com/gina'
    WHEN key = 'footer.quick_links.home' THEN '/'
    WHEN key = 'footer.quick_links.products' THEN '/search'
    WHEN key = 'footer.quick_links.about' THEN '/about'
    WHEN key = 'footer.quick_links.contact' THEN '/contact'
    WHEN key = 'footer.quick_links.blog' THEN '/blog'
    WHEN key = 'footer.quick_links.help' THEN '/help'
    WHEN key = 'footer.quick_links.privacy' THEN '/privacy'
    WHEN key = 'footer.quick_links.terms' THEN '/terms'
    WHEN key = 'footer.app.ios_url' THEN 'https://apps.apple.com/app/gina'
    WHEN key = 'footer.app.android_url' THEN 'https://play.google.com/store/apps/details?id=com.gina'
    WHEN key = 'footer.app.qrcode' THEN '/images/qrcode/app-download.png'
    ELSE url
  END,
  updated_at = CURRENT_TIMESTAMP
WHERE category = 'footer';