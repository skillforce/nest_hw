import { NumericIdEntity } from '../../common/domain/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Length } from 'class-validator';
import { Blog } from './blog.entity';

export const titleConstraints = {
  minLength: 1,
  maxLength: 30,
};
export const shortDescriptionConstraints = {
  minLength: 1,
  maxLength: 100,
};
export const contentConstraints = {
  minLength: 1,
  maxLength: 1000,
};

@Entity('Posts')
export class Post extends NumericIdEntity {
  @Column({ nullable: false })
  @Length(titleConstraints.minLength, titleConstraints.maxLength)
  title: string;

  @Column({ nullable: false })
  @Length(
    shortDescriptionConstraints.minLength,
    shortDescriptionConstraints.maxLength,
  )
  shortDescription: string;

  @Column({ nullable: false })
  @Length(contentConstraints.minLength, contentConstraints.maxLength)
  content: string;

  @Column()
  blogId: number;

  @ManyToOne(() => Blog, (blog) => blog.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blogId' }) // maps to the column above
  blog?: Blog;
}
