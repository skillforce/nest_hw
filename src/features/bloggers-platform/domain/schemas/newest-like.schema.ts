import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  _id: false,
})
export class NewestLike {
  @Prop({ type: Date, default: new Date() })
  addedAt: Date;

  @Prop({ type: String, default: '1' })
  userId: string;

  @Prop({ type: String, default: 'A' })
  login: string;
}

export const NewestLikeSchema = SchemaFactory.createForClass(NewestLike);
