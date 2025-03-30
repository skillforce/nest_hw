import { Injectable } from '@nestjs/common';

export enum EmailLayouts {
  REGISTRATION = 'REGISTRATION',
  PASSWORD_RECOVERY = 'PASSWORD_RECOVERY',
}

@Injectable()
export class EmailLayoutService {
  private generateEmailLayout(emailBodyLayout: string): string {
    return `<!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                table {
                    max-width: 600px;
                    margin: 40px auto;
                    background: #ffffff;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    border-collapse: collapse;
                }
                td {
                    padding: 20px;
                }
                h1 {
                    color: #333;
                    margin: 0;
                }
                p {
                    color: #555;
                    font-size: 16px;
                    line-height: 1.6;
                    margin: 0 0 10px;
                }
                .button {
                    display: inline-block;
                    background-color: #007bff;
                    color: white;
                    padding: 12px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-size: 16px;
                    margin-top: 20px;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 14px;
                    color: #777;
                }
            </style>
        </head>
        <body>
            <table>
                <tr>
                    <td>
                        ${emailBodyLayout}
                    </td>
                </tr>
            </table>
        </body>
    </html>`;
  }

  getEmailTemplate(type: EmailLayouts, code: string): string {
    switch (type) {
      case EmailLayouts.REGISTRATION:
        return this.generateEmailLayout(`
          <h1>Registration Successful!</h1>
          <p>Dear User,</p>
          <p>Thank you for registering! Your account has been successfully created. You can now log in and enjoy our services.</p>
          <a href="https://somesite.com/confirm-email?code=${code}" class="button">Confirm registration</a>
          <p class="footer">If you did not create this account, please ignore this email.</p>
        `);
      case EmailLayouts.PASSWORD_RECOVERY:
        return this.generateEmailLayout(`
          <h1>Password Recovery</h1>
          <p>To finish password recovery, please follow the link below:</p>
          <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>Recover Password</a>
        `);
      default:
        throw new Error('Invalid email type');
    }
  }
}
