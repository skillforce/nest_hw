import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserRegisteredEvent } from '../../user-accounts/domain/events/user-registered.event';
import { EmailService } from '../email.service';

@EventsHandler(UserRegisteredEvent)
export class SendConfirmationEmailWhenUserRegisteredEventHandler
  implements IEventHandler<UserRegisteredEvent>
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
