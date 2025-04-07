import { LikesInfoViewDto } from './like-info.view-dto';
import { NewestLikeViewDto } from './newest-like.view-dto';

export class ExtendedLikesInfoViewDto extends LikesInfoViewDto {
  newestLikes: NewestLikeViewDto[];
}
