import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { EmailLayoutService } from './layout-templates/content-templetes/email-layout-service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport:
        'smtps://denislvdbel@gmail.com:fvqp qcoh mond ivlx@smtp.gmail.com',
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
    }),
  ],
  providers: [EmailService, EmailLayoutService],
  exports: [EmailService, EmailLayoutService],
})
export class NotificationsModule {}
