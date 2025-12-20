/**
 * 认证模块邮件模板
 * 处理邮箱验证、密码重置等认证相关的邮件模板
 */

import type { EmailTemplate } from "../email/email.types";
import { createVerificationTemplate } from "../email/templates/template.utils";

/**
 * 创建邮箱验证邮件模板
 */
export function createEmailVerificationTemplate(
  email: string,
  verificationLink: string
): EmailTemplate {
  return createVerificationTemplate({
    title: "邮箱验证",
    description: "感谢您注册我们的服务！请点击下面的链接验证您的邮箱地址：",
    buttonText: "验证邮箱",
    link: verificationLink,
    expirationHours: 24,
    additionalContent: `
      <div style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border-radius: 5px; border-left: 4px solid #ffc107;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          <strong>安全提示：</strong>如果您没有注册此账户，请忽略此邮件。我们不会存储您的信息。
        </p>
      </div>
    `,
  });
}

/**
 * 创建密码重置邮件模板
 */
export function createPasswordResetTemplate(
  email: string,
  resetLink: string
): EmailTemplate {
  return createVerificationTemplate({
    title: "密码重置",
    description: "您请求重置密码。请点击下面的链接重置您的密码：",
    buttonText: "重置密码",
    link: resetLink,
    expirationHours: 1,
    additionalContent: `
      <div style="margin-top: 30px; padding: 15px; background-color: #f8d7da; border-radius: 5px; border-left: 4px solid #dc3545;">
        <p style="margin: 0; color: #721c24; font-size: 14px;">
          <strong>安全提示：</strong>
        </p>
        <ul style="margin: 10px 0 0 20px; color: #721c24; font-size: 14px;">
          <li>此链接仅用于重置密码</li>
          <li>请勿将此链接分享给他人</li>
          <li>如果您没有请求重置密码，请忽略此邮件</li>
          <li>重置后请使用强密码</li>
        </ul>
      </div>
    `,
  });
}
