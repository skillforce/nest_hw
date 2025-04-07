import { EmailLayouts } from '../../../notifications/layout-templates/content-templetes/email-layout.service';

export class UserRegisteredEvent {
  constructor(
    public email: string,
    public code: string,
    public emailType: EmailLayouts = EmailLayouts.REGISTRATION,
  ) {}
}
