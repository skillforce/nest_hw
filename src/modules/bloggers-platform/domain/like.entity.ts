import { LikeStatusEnum } from './dto/like-domain.dto';

export class Like {
  id: number;
  parentId: string;
  userId: string;
  likeStatus: LikeStatusEnum;
  deletedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;

  //
  // static createInstance(likeDTO: LikeDomainDto): LikeDocument {
  //   const like = new this() as LikeDocument;
  //
  //   like.parentId = likeDTO.parentId;
  //   like.userId = likeDTO.userId;
  //   like.likeStatus = likeDTO.likeStatus;
  //
  //   return like;
  // }
  //
  // makeDeleted() {
  //   if (this.deletedAt !== null) {
  //     throw new DomainException({
  //       code: DomainExceptionCode.BadRequest,
  //       message: 'Like already deleted',
  //     });
  //   }
  //   this.deletedAt = new Date();
  // }
  // update(updateLikeDto: UpdateLikeDomainDto) {
  //   this.likeStatus = updateLikeDto.likeStatus;
  // }
}
