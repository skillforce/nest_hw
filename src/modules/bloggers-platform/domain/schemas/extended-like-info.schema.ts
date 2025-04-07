import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatusEnum } from './like-info.schema';
import { NewestLike, NewestLikeSchema } from './newest-like.schema';

@Schema({
  _id: false,
})
export class ExtendedLikesInfo {
  @Prop({ type: Number, default: 0 })
  likesCount: number;

  @Prop({ type: Number, default: 0 })
  dislikesCount: number;

  @Prop({
    type: String,
    enum: LikeStatusEnum,
    default: LikeStatusEnum.None,
  })
  myStatus: LikeStatusEnum;

  @Prop({
    type: [NewestLikeSchema],
    validate: [(val: NewestLike[]) => val.length <= 3, 'Max 3 likes allowed'],
  })
  newestLikes: NewestLike[];
}

export const ExtendedLikesInfoSchema =
  SchemaFactory.createForClass(ExtendedLikesInfo);
