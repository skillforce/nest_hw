export enum LikeStatusEnum {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

export class LikeDomainDto {
  likeStatus: LikeStatusEnum;
  userId: number;
  parentId: number;
}
export class UpdateLikeDomainDto {
  likeStatus: LikeStatusEnum;
}
