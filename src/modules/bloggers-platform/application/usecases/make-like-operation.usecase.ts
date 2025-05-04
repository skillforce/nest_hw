import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { MakeLikeDto } from '../../dto/like.dto';
import { Like, LikeDocument, LikeModelType } from '../../domain/like.entity';
import { LikesRepository } from '../../infrastructure/like.repository';
import { UsersRepository } from '../../../user-accounts/infrastructure/users.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';

export enum LikeParentInstanceEnum {
  POST = 'Post',
  COMMENT = 'Comment',
}

export class MakeLikeOperationCommand {
  constructor(
    public likeDto: MakeLikeDto,
    public userId: string,
    public parentId: number,
    public parentInstance: LikeParentInstanceEnum,
  ) {}
}

@CommandHandler(MakeLikeOperationCommand)
export class MakeLikeOperationUseCase
  implements ICommandHandler<MakeLikeOperationCommand, void>
{
  constructor(
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
    private likesRepository: LikesRepository,
    private usersRepository: UsersRepository,
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute({
    likeDto,
    userId,
    parentId,
    parentInstance,
  }: MakeLikeOperationCommand): Promise<void> {
    if (parentInstance === LikeParentInstanceEnum.POST) {
      await this.postsRepository.findOrNotFoundFail(parentId);
    } else if (parentInstance === LikeParentInstanceEnum.COMMENT) {
      await this.commentsRepository.findOrNotFoundFail(parentId.toString());
    }

    const like = await this.likesRepository.findByUserIdAndParentId(
      userId,
      parentId.toString(),
    );

    if (!like) {
      await this.createLike(likeDto, userId, parentId.toString());
    } else {
      await this.updateLike(likeDto, like);
    }
  }
  private async createLike(
    likeDto: MakeLikeDto,
    userId: string,
    parentId: string,
  ) {
    const newLike = this.LikeModel.createInstance({
      ...likeDto,
      userId,
      parentId,
    });
    await this.likesRepository.save(newLike);
  }
  private async updateLike(likeDto: MakeLikeDto, like: LikeDocument) {
    if (like.likeStatus !== likeDto.likeStatus) {
      like.likeStatus = likeDto.likeStatus;
      await this.likesRepository.save(like);
    }
  }
}
