import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class PasswordRecoveryConfirmation {
  @Prop({ type: String, nullable: true, default: null })
  confirmationCode: string | null;

  @Prop({ type: Date, nullable: true, default: null })
  confirmationExpiresAt: Date | null;
}

export const PasswordRecoveryConfirmationSchema = SchemaFactory.createForClass(
  PasswordRecoveryConfirmation,
);
