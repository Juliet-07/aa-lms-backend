import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER || 'api',
        pass: process.env.MAIL_PASS || '96691b1f0d18a9598e54a5817b0789aa',
        authMethod: 'PLAIN,LOGIN',
      },
      tls: {
        rejectUnauthorized: process.env.MAIL_STARTTLS === 'true',
      },
      debug: true,
    });
    console.log('MAIL_USER:', process.env.MAIL_USER);
    console.log('MAIL_PASS:', process.env.MAIL_PASS);
  }

  private loadTemplate(templateName: string): string {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'templates',
      'emails',
      `${templateName}.html`,
    );
    return fs.readFileSync(templatePath, 'utf-8');
  }

  private replaceTemplateVariables(
    template: string,
    variables: Record<string, string>,
  ): string {
    let result = template;
    Object.keys(variables).forEach((key) => {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), variables[key]);
    });
    return result;
  }

  async sendUserWelcomeEmail(
    email: string,
    firstName: string,
    verificationUrl: string | null = null,
  ) {
    try {
      const template = this.loadTemplate('welcome');

      // Build the verification button block — or an empty string if not needed (e.g. OAuth)
      const verificationBlock = verificationUrl
        ? `
          <tr>
            <td style="padding: 0 40px 30px 40px; text-align: center;">
              <p style="font-size: 15px; color: #555555; margin-bottom: 20px;">
                To get started, please verify your email address by clicking the button below.
                This link will expire in <strong>24 hours</strong>.
              </p>
              <a
                href="${verificationUrl}"
                style="
                  display: inline-block;
                  background-color: #d00000;
                  color: #ffffff;
                  font-size: 16px;
                  font-weight: bold;
                  text-decoration: none;
                  padding: 14px 32px;
                  border-radius: 6px;
                "
              >
                Verify My Email
              </a>
              <p style="font-size: 13px; color: #999999; margin-top: 16px;">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="${verificationUrl}" style="color: #d00000; word-break: break-all;">${verificationUrl}</a>
              </p>
            </td>
          </tr>
        `
        : '';

      const htmlContent = this.replaceTemplateVariables(template, {
        USER_NAME: firstName || 'there',
        CURRENT_YEAR: new Date().getFullYear().toString(),
        VERIFICATION_BLOCK: verificationBlock,
      });

      const mailOptions = {
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Welcome to Kujua360! Please verify your email ✉️',
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.response);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw error;
    }
  }
}
