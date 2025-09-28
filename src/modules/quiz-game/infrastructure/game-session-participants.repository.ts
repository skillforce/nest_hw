import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { GameSessionParticipants } from '../domain/game-session-participants.entity';

@Injectable()
export class GameSessionParticipantsRepository {
  constructor(
    @InjectRepository(GameSessionParticipants)
    private readonly gameSessionParticipantsOrmRepository: Repository<GameSessionParticipants>,
    private readonly minMaxAmountOfParticipants = 2,
  ) {}

  async findActiveByUserId(
    userId: number,
  ): Promise<GameSessionParticipants | null> {
    if (!Number.isInteger(Number(userId))) {
      return null;
    }
    return await this.gameSessionParticipantsOrmRepository.findOne({
      where: {
        user_id: userId,
        deletedAt: IsNull(),
        finished_at: IsNull(),
      },
      relations: ['user'],
    });
  }
  async findSecondParticipantByGameSessionId(
    gameSessionId: number,
    firstParticipantId: number,
  ): Promise<GameSessionParticipants | null> {
    if (!Number.isInteger(Number(gameSessionId))) {
      return null;
    }
    return await this.gameSessionParticipantsOrmRepository.findOne({
      where: {
        game_session_id: gameSessionId,
        user_id: Not(firstParticipantId),
        deletedAt: IsNull(),
      },
      relations: ['user'],
    });
  }
  async findActiveByUserIdOrNotFoundFail(
    userId: number,
  ): Promise<GameSessionParticipants> {
    const gameSessionParticipant = await this.findActiveByUserId(userId);

    if (!gameSessionParticipant) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'game session participant',
            message: 'game session participant not found',
          },
        ],
        message: 'game session participant not found',
      });
    }

    return gameSessionParticipant;
  }
  findByGameSessionId(
    gameSessionId: number,
  ): Promise<GameSessionParticipants[]> {
    return this.gameSessionParticipantsOrmRepository.find({
      where: {
        game_session_id: gameSessionId,
        deletedAt: IsNull(),
      },
    });
  }

  async save(
    gameSessionParticipant: Omit<GameSessionParticipants, 'id'> & {
      id?: number;
    },
  ): Promise<number> {
    const result = await this.gameSessionParticipantsOrmRepository.save(
      gameSessionParticipant,
    );

    return result.id;
  }
}
