export enum LikeStatusEnum {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

export class LikeDomainDto {
  likeStatus: LikeStatusEnum;
  userId: string;
  parentId: string;
}
export class UpdateLikeDomainDto {
  likeStatus: LikeStatusEnum;
}
