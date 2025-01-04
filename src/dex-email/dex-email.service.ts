// email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
/*************  ✨ Codeium Command 🌟  *************/
/**
 * Service for sending emails using a SMTP server.
 *
 **/
export class DexEmailService {
  private transporter: nodemailer.Transporter;

  /**
   * Initializes the email service by creating a transporter using the given SMTP server.
   *
   * The transporter is configured to use the given SMTP server with the given port and
   * authentication details.
   *
   * @example
   * const emailService = new DexEmailService();
   * emailService.transporter // Is a nodemailer.Transporter
   */
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com', // Example SMTP server
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: '82e1e1001@smtp-brevo.com',
        pass: 'jshIG4B8ObCD3tUm',
      },
    });
  }

  /**
   * Sends an email using the SMTP server configured in the constructor.
   *
   * @example
   * const emailService = new DexEmailService();
   * await emailService.sendEmail({
   *   to: 'user@example.com',
   *   subject: 'Hello from Block Tracker',
   *   text: 'This is a test email sent by the Block Tracker app.',
   * });
   *
   * @param {object} options - The email options
   * @param {string} options.to - The recipient's email address
   * @param {string} options.subject - The subject of the email
   * @param {string} options.text - The text of the email
   */
  async sendEmail({
    to,
    subject,
    text,
  }: {
    to: string;
    subject: string;
    text: string;
  }) {
    try {
      const info = await this.transporter.sendMail({
        from: 'aaarav666@gmail.com',
        to,
        subject,
        text,
      });

      console.log('Message sent: %s', info.messageId);
    } catch (error) {
      console.log(`Failed to send email to: ${to} \n Error: ${error}`);
    }
  }
}
