import { LikeStatusEnum } from './dto/like-domain.dto';
import { NumericIdEntity } from '../../common/domain/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('Likes')
export class Like extends NumericIdEntity {
  @Column({
    nullable: false,
  })
  parentId: string;

  @Column()
  userId: number;

  @Column({
    type: 'enum',
    enum: LikeStatusEnum,
    default: LikeStatusEnum.NONE,
  })
  likeStatus: LikeStatusEnum;
}
