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

  // async sendUserWelcomeEmail(email: string, firstName: string) {
  //   const mailOptions = {
  //     from: process.env.MAIL_FROM,
  //     to: email,
  //     subject: 'Welcome to Kujua360',
  //     html: `
  //       <p>Hi ${firstName || 'there'},</p>
  //       <p>Welcome! We're excited to have you on board.</p>
  //       <p>Your account has been successfully created. You can now log in and start exploring all the features we have to offer.</p>
  //       <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
  //       <p>Best regards,<br>The AA Team</p>
  //     `,
  //   };

  //   try {
  //     const info = await this.transporter.sendMail(mailOptions);
  //     console.log('✅ Email sent:', info.response);
  //   } catch (error) {
  //     console.error('❌ Failed to send email:', error);
  //   }
  // }

  async sendUserWelcomeEmail(email: string, firstName: string) {
    try {
      // Load the template
      const template = this.loadTemplate('welcome');

      // Replace variables
      const htmlContent = this.replaceTemplateVariables(template, {
        USER_NAME: firstName || 'there',
        CURRENT_YEAR: new Date().getFullYear().toString(),
        // APP_URL: process.env.APP_URL || 'https://yourapp.com',
      });

      const mailOptions = {
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Welcome to Kujua360! 🎉',
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
