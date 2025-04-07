export enum LikeStatusEnum {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export class LikeDomainDto {
  likeStatus: LikeStatusEnum;
  userId: string;
  parentId: string;
}
export class UpdateLikeDomainDto {
  likeStatus: LikeStatusEnum;
}
