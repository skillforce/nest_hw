import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { NumericIdEntity } from '../../common/domain/base.entity';
import { Length } from 'class-validator';
import { Post } from './post.entity';
import { User } from '../../user-accounts/domain/entities/user.entity';

export const CommentContentConstraints = {
  minLength: 20,
  maxLength: 300,
};

@Entity('Comments')
export class Comment extends NumericIdEntity {
  @Column({ nullable: false })
  @Length(
    CommentContentConstraints.minLength,
    CommentContentConstraints.maxLength,
  )
  content: string;

  postId: number;

  creatorId: number;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;
}
