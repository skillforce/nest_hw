import { EmailLayouts } from '../../../notifications/layout-templates/content-templetes/email-layout.service';

export class PasswordRecoveryInitializedEvent {
  constructor(
    public email: string,
    public code: string,
    public emailType: EmailLayouts = EmailLayouts.PASSWORD_RECOVERY,
  ) {}
}
