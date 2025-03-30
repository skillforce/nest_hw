import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class EmailConfirmation {
  @Prop({ type: String, nullable: true, default: null })
  confirmationCode: string | null;

  @Prop({ type: Date, nullable: true, default: null })
  confirmationExpiresAt: Date | null;

  @Prop({ type: Boolean, default: false })
  isConfirmed: boolean;
}

export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);
