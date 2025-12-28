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

  async getUserScoreAndSessionsCount(userId: number): Promise<{
    totalScore: number;
    sessionsCount: number;
    gameSessionsIds: number[];
  }> {
    const result = await this.gameSessionParticipantsOrmRepository
      .createQueryBuilder('gsp')
      .select('COALESCE(SUM(gsp.score), 0)', 'totalScore')
      .addSelect('COUNT(DISTINCT gsp.game_session_id)', 'sessionsCount')
      .addSelect('ARRAY_AGG(DISTINCT gsp.game_session_id)', 'gameSessionsIds')
      .where('gsp.user_id = :userId', { userId })
      .andWhere('gsp.finished_at IS NOT NULL')
      .getRawOne();

    return {
      totalScore: Number(result.totalScore),
      sessionsCount: Number(result.sessionsCount),
      gameSessionsIds: result.gameSessionsIds
        ? result.gameSessionsIds.map(Number)
        : [],
    };
  }
  async findMostRecentByUserId(
    userId: number,
  ): Promise<GameSessionParticipants | null> {
    if (!Number.isInteger(Number(userId))) {
      return null;
    }
    return await this.gameSessionParticipantsOrmRepository.findOne({
      where: {
        user_id: userId,
        deletedAt: IsNull(),
      },
      order: {
        createdAt: 'DESC',
      },
      relations: ['user', 'gameSession'],
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

  async findMostRecentByUserIdOrNotFoundFail(
    userId: number,
  ): Promise<GameSessionParticipants> {
    const gameSessionParticipant = await this.findMostRecentByUserId(userId);

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
    isUserEntityAttached = false,
  ): Promise<GameSessionParticipants[]> {
    return this.gameSessionParticipantsOrmRepository.find({
      where: {
        game_session_id: gameSessionId,
        deletedAt: IsNull(),
      },
      relations: isUserEntityAttached ? ['user'] : [],
    });
  }
  async save(
    gameSessionParticipant: Omit<GameSessionParticipants, 'id'> & {
      id?: number;
    },
  ): Promise<any> {
    const result = await this.gameSessionParticipantsOrmRepository.save(
      gameSessionParticipant,
    );

    return result.id;
  }
}
