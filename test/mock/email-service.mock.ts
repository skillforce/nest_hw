import { EmailService } from '../../src/modules/notifications/email.service';

export class EmailServiceMock extends EmailService {
  //override method
  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    console.log('Call mock method sendConfirmationEmail / EmailServiceMock');
    console.log(email);
    console.log(code);

    return;
  }
}
