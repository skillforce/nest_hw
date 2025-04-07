import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PasswordRecoveryInitializedEvent } from '../../user-accounts/domain/events/password-recovery-initialized.event';
import { EmailService } from '../email.service';
import { UserRegisteredEvent } from '../../user-accounts/domain/events/user-registered.event';

@EventsHandler(PasswordRecoveryInitializedEvent)
export class SendEmailWhenUserInitializedPasswordRecoveryEventHandler
  implements IEventHandler<PasswordRecoveryInitializedEvent>
{
  constructor(private emailService: EmailService) {}

  async handle(event: UserRegisteredEvent) {
    const { email, code, emailType } = event;
    try {
      this.emailService.sendConfirmationEmail(email, code, emailType);
    } catch (e) {
      throw new Error(JSON.stringify(e));
    }
  }
}
