import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import {
  EmailLayoutService,
  EmailLayouts,
} from './layout-templates/content-templetes/email-layout-service';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private emailLayoutService: EmailLayoutService,
  ) {}

  async sendConfirmationEmail(
    email: string,
    code: string,
    type: EmailLayouts,
  ): Promise<void> {
    await this.mailerService.sendMail({
      html: this.emailLayoutService.getEmailTemplate(type, code),
      to: email,
    });
  }
}
