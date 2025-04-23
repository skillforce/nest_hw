export class PasswordRecoveryConfirmation {
  confirmationCode: string | null;
  confirmationExpiresAt: Date | null;
  userId: string;
  isConfirmed: boolean;
  id?: string;
}
