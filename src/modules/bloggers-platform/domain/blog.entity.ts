import { Column, Entity, OneToMany } from 'typeorm';
import { NumericIdEntity } from '../../common/domain/base.entity';
import { Length, Matches } from 'class-validator';
import { Post } from './post.entity';

export const blogNameConstraint = { minLength: 1, maxLength: 15 };
export const blogDescriptionConstraint = { minLength: 1, maxLength: 500 };
export const blogUrlConstraint = {
  minLength: 1,
  maxLength: 100,
  pattern:
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
};

@Entity('Blogs')
export class Blog extends NumericIdEntity {
  @Column({ nullable: false })
  @Length(blogNameConstraint.minLength, blogNameConstraint.maxLength)
  name: string;
  @Column({ nullable: false })
  @Length(
    blogDescriptionConstraint.minLength,
    blogDescriptionConstraint.maxLength,
  )
  description: string;

  @Column({ default: false })
  isMembership: boolean;

  @Column()
  @Length(blogUrlConstraint.minLength, blogUrlConstraint.maxLength)
  @Matches(blogUrlConstraint.pattern)
  websiteUrl: string;

  @OneToMany(() => Post, (post) => post.blog)
  posts?: Post[];
}
