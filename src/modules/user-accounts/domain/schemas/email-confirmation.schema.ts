export class EmailConfirmation {
  confirmationCode: string | null;
  confirmationExpiresAt: Date | null;
  isConfirmed: boolean;
  userId: string;
  id?: string;
}
