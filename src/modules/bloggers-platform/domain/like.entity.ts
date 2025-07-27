import { LikeStatusEnum } from './dto/like-domain.dto';
import { NumericIdEntity } from '../../common/domain/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../user-accounts/domain/entities/user.entity';

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

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;
}
