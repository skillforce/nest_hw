import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { MakeLikeDto } from '../../dto/like.dto';
import { Like, LikeDocument, LikeModelType } from '../../domain/like.entity';
import { LikesRepository } from '../../infrastructure/like.repository';

export class MakeLikeOperationCommand {
  constructor(
    public likeDto: MakeLikeDto,
    public userId: string,
    public parentId: string,
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
  ) {}

  async execute({
    likeDto,
    userId,
    parentId,
  }: MakeLikeOperationCommand): Promise<void> {
    const like = await this.likesRepository.findByUserIdAndParentId(
      userId,
      parentId,
    );

    if (!like) {
      await this.createLike(likeDto, userId, parentId);
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
