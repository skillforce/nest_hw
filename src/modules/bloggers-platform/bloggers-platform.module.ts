import { Module } from '@nestjs/common';
import { BlogsController } from './api/blogs/blogs-controller';
import { PostsController } from './api/posts-controller';
import { CommentsController } from './api/comments-controller';
import { CommentsService } from './application/comments-service';
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
import { LikesQueryRepository } from './infrastructure/query/likes.query-repository';
import { BlogsPublicController } from './api/blogs/blogs-controller.public';
import { DeletePostByBlogIdUseCase } from './application/usecases/delete-post-by-blog-id.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user-accounts/domain/entities/user.entity';
import { Blog } from './domain/blog.entity';
import { Post } from './domain/post.entity';
import { Like } from './domain/like.entity';
import { Comment } from './domain/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Blog, Post, Like, Comment])],
  controllers: [
    BlogsController,
    BlogsPublicController,
    PostsController,
    CommentsController,
  ],
  providers: [
    CommentsService,
    BlogsRepository,
    UsersRepository,
    LikesRepository,
    BlogsQueryRepository,
    LikesQueryRepository,
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
    DeletePostByBlogIdUseCase,
  ],
  exports: [],
})
export class BloggersPlatformModule {}
