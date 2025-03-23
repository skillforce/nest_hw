import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum LikeStatusEnum {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

@Schema({
  _id: false,
})
export class LikesInfo {
  @Prop({ type: Number, required: true, default: 0 })
  likesCount: number;

  @Prop({ type: Number, required: true, default: 0 })
  dislikesCount: number;

  @Prop({
    type: String,
    enum: LikeStatusEnum,
    required: true,
    default: LikeStatusEnum.None,
  })
  myStatus: LikeStatusEnum;
}

export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);
