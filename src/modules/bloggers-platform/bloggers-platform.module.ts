import { Module } from '@nestjs/common';
import { BlogsController } from './api/blogs-controller';
import { PostsController } from './api/posts-controller';
import { CommentsController } from './api/comments-controller';
import { CommentsService } from './application/comments-service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user-accounts/domain/user.entity';
import { Post, PostSchema } from './domain/post.entity';
import { Blog, BlogSchema } from './domain/blog.entity';
import { Comment, CommentSchema } from './domain/comment.entity';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { BlogsQueryRepository } from './infrastructure/query/blogs.query-repository';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsQueryRepository } from './infrastructure/query/posts.query-repository';
import { CommentsQueryRepository } from './infrastructure/query/comments.query-repository';
import { CreatePostUseCase } from './application/usecases/create-post.usecase';
import { UpdatePostUseCase } from './application/usecases/update-post.usecase';
import { DeletePostUseCase } from './application/usecases/delete-post.usecase';
import { CreateBlogUseCase } from './application/usecases/create-blog.usecase';
import { UpdateBlogUseCase } from './application/usecases/update-blog.usecase';
import { DeleteBlogUseCase } from './application/usecases/delete-blog.usecase';
import { CreateCommentUseCase } from './application/usecases/create-comment.usecase';
import { UsersRepository } from '../user-accounts/infrastructure/users.repository';
import { CommentsRepository } from './infrastructure/comments.repository';
import { UpdateCommentUseCase } from './application/usecases/update-comment.usecase';
import { DeleteCommentUseCase } from './application/usecases/delete-comment.usecase';
import { MakeLikeOperationUseCase } from './application/usecases/make-like-operation.usecase';
import { LikesRepository } from './infrastructure/like.repository';
import { Like, LikeSchema } from './domain/like.entity';

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
      {
        name: Like.name,
        schema: LikeSchema,
      },
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    CommentsService,
    BlogsRepository,
    UsersRepository,
    LikesRepository,
    BlogsQueryRepository,
    PostsRepository,
    PostsQueryRepository,
    CommentsQueryRepository,
    CommentsRepository,
    CreatePostUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,
    CreateBlogUseCase,
    UpdateBlogUseCase,
    DeleteBlogUseCase,
    CreateCommentUseCase,
    UpdateCommentUseCase,
    DeleteCommentUseCase,
    MakeLikeOperationUseCase,
  ],
  exports: [],
})
export class BloggersPlatformModule {}
