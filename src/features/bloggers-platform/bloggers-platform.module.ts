import { Module } from '@nestjs/common';
import { BlogsController } from './api/blogs-controller';
import { PostsController } from './api/posts-controller';
import { CommentsController } from './api/comments-controller';
import { BlogsService } from './application/blogs-service';
import { PostsService } from './application/posts-service';
import { CommentsService } from './application/comments-service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user-accounts/domain/user.entity';
import { Post, PostSchema } from './domain/post.entity';
import { Blog, BlogSchema } from './domain/blog.entity';
import { CommentSchema, Comment } from './domain/comment.entity';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { BlogsQueryRepository } from './infrastructure/query/blogs.query-repository';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsQueryRepository } from './infrastructure/query/posts.query-repository';
import { CommentsQueryRepository } from './infrastructure/query/comments.query-repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Blog.name,
        schema: BlogSchema,
      },
      {
        name: Post.name,
        schema: PostSchema,
      },
      {
        name: Comment.name,
        schema: CommentSchema,
      },
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsService,
    PostsService,
    CommentsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsRepository,
    PostsQueryRepository,
    CommentsQueryRepository,
  ],
  exports: [],
})
export class BloggersPlatformModule {}
