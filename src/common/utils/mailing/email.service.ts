import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER || 'api',
        pass: process.env.MAIL_PASS || '7f608d469e261486705539e674a462dd',
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

  async sendUserWelcomeEmail(email: string, firstName: string) {
    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: email,
      subject: 'Welcome',
      html: `
        <p>Hi ${firstName || 'there'},</p>
        <p>Welcome! We're excited to have you on board.</p>
        <p>Your account has been successfully created. You can now log in and start exploring all the features we have to offer.</p>
        <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The AA Team</p>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.response);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
    }
  }
}
