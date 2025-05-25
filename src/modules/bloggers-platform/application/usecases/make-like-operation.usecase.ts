import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MakeLikeDto } from '../../dto/like.dto';
import { Like } from '../../domain/like.entity';
import { LikesRepository } from '../../infrastructure/like.repository';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { LikeDomainDto } from '../../domain/dto/like-domain.dto';

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
    private likesRepository: LikesRepository,
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
      await this.commentsRepository.findOrNotFoundFail(parentId);
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
    const newLike = this.createInstance({
      ...likeDto,
      userId,
      parentId,
    });

    console.log(newLike);
    await this.likesRepository.save(newLike);
  }

  private async updateLike(likeDto: MakeLikeDto, likeToUpdate: Like) {
    if (likeToUpdate.likeStatus !== likeDto.likeStatus) {
      const updatedLike = {
        ...likeToUpdate,
        likeStatus: likeDto.likeStatus,
      };
      console.log(updatedLike, 'ddd');
      await this.likesRepository.save(updatedLike);
    }
  }

  private createInstance(likeDTO: LikeDomainDto): Like {
    const like = new Like();

    like.parentId = likeDTO.parentId;
    like.userId = likeDTO.userId;
    like.likeStatus = likeDTO.likeStatus;

    return like;
  }
}
