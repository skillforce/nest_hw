import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';
import { PostDto, UpdatePostDto } from '../dto/post.dto';
import { PostsRepository } from '../infrastructure/posts.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly PostModel: PostModelType,
    private readonly postRepository: PostsRepository,
  ) {}
  async createPost(createPostDto: PostDto): Promise<string> {
    const newPost = this.PostModel.createInstance(createPostDto);

    return newPost._id.toString();
  }

  async updatePostById(
    id: string,
    updatePostDto: UpdatePostDto,
  ): Promise<string> {
    const post = await this.postRepository.findOrNotFoundFail(id);

    post.update(updatePostDto);

    const updatedPost = await this.postRepository.save(post);

    return updatedPost._id.toString();
  }

  async deleteBlogById(id: string) {
    const blog = await this.postRepository.findOrNotFoundFail(id);

    blog.makeDeleted();

    await this.postRepository.save(blog);
  }
}
