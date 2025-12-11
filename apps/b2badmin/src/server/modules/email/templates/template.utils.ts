/**
 * 邮件模板工具
 * 提供通用的邮件模板构建功能
 */

import type { EmailTemplate } from "../email.types";

/**
 * 创建基础邮件模板结构
 */
export function createBaseTemplate(): {
  header: string;
  footer: string;
  containerStyle: string;
} {
  return {
    header: `
      <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">${"系统通知"}</h1>
      </div>
    `,
    footer: `
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>此邮件由系统自动发送，请勿回复。</p>
        <p>© ${new Date().getFullYear()} ${"Your Company"}. All rights reserved.</p>
      </div>
    `,
    containerStyle: `
      max-width: 600px;
      margin: 0 auto;
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    `,
  };
}

/**
 * 构建完整的HTML邮件模板
 */
export function buildHtmlTemplate({
  title,
  content,
  customHeader = "",
  customFooter = "",
}: {
  title: string;
  content: string;
  customHeader?: string;
  customFooter?: string;
}): string {
  const base = createBaseTemplate();
  const header = customHeader || base.header;
  const footer = customFooter || base.footer;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="${base.containerStyle} background-color: white; margin: 20px auto; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        ${header}
        <div style="padding: 20px;">
          ${content}
        </div>
        ${footer}
      </div>
    </body>
    </html>
  `;
}

/**
 * 创建验证类邮件模板
 */
export function createVerificationTemplate({
  title,
  description,
  buttonText,
  link,
  expirationHours = 24,
  additionalContent = "",
}: {
  title: string;
  description: string;
  buttonText: string;
  link: string;
  expirationHours?: number;
  additionalContent?: string;
}): EmailTemplate {
  const subject = title;
  const text = `${description}\n\n请点击以下链接：${link}\n\n此链接将在${expirationHours}小时后过期。`;

  const html = buildHtmlTemplate({
    title,
    content: `
      <div style="text-align: center; padding: 20px 0;">
        <h2 style="color: #333; margin-bottom: 20px;">${title}</h2>
        <p style="font-size: 16px; color: #666; margin-bottom: 30px;">${description}</p>

        <div style="margin: 30px 0;">
          <a href="${link}"
             style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            ${buttonText}
          </a>
        </div>

        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            如果按钮无法点击，请复制以下链接到浏览器地址栏：
          </p>
          <p style="margin: 10px 0 0 0;">
            <code style="background-color: #e9ecef; padding: 5px 10px; border-radius: 3px; font-size: 12px;">
              ${link}
            </code>
          </p>
        </div>

        <p style="color: #666; font-size: 14px;">
          此链接将在${expirationHours}小时后过期。
        </p>

        ${additionalContent ? `<div style="margin-top: 20px;">${additionalContent}</div>` : ""}
      </div>
    `,
  });

  return { subject, text, html };
}
