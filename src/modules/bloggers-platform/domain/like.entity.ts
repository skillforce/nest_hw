import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import {
  LikeDomainDto,
  LikeStatusEnum,
  UpdateLikeDomainDto,
} from './dto/like-domain.dto';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Schema({ timestamps: true })
export class Like {
  @Prop({
    required: true,
    type: String,
  })
  parentId: string;

  @Prop({ required: true, type: String })
  userId: string;

  @Prop({
    type: String,
    enum: LikeStatusEnum,
    required: true,
  })
  likeStatus: LikeStatusEnum;

  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;

  createdAt?: Date;
  updatedAt?: Date;

  get id() {
    //@ts-ignore
    //eslint-disable-next-line
    return this._id.toString();
  }

  static createInstance(likeDTO: LikeDomainDto): LikeDocument {
    const like = new this() as LikeDocument;

    like.parentId = likeDTO.parentId;
    like.userId = likeDTO.userId;
    like.likeStatus = likeDTO.likeStatus;

    return like;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Like already deleted',
      });
    }
    this.deletedAt = new Date();
  }
  update(updateLikeDto: UpdateLikeDomainDto) {
    this.likeStatus = updateLikeDto.likeStatus;
  }
}

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.loadClass(Like);

export type LikeDocument = HydratedDocument<Like>;

export type LikeModelType = Model<LikeDocument> & typeof Like;
