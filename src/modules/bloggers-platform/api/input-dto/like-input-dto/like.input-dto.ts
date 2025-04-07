import { IsEnum, IsString } from 'class-validator';
import { LikeStatusEnum } from '../../../domain/dto/like-domain.dto';

export class LikeInputDto {
  @IsString()
  @IsEnum(LikeStatusEnum)
  likeStatus: LikeStatusEnum;
}
