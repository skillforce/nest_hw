import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { GameSession } from '../domain/game-session.entity';

@Injectable()
export class GameSessionsRepository {
  constructor(
    @InjectRepository(GameSession)
    private readonly gameSessionsOrmRepository: Repository<GameSession>,
  ) {}

  async findById(id: number): Promise<GameSession | null> {
    if (!Number.isInteger(Number(id))) {
      return null;
    }
    return await this.gameSessionsOrmRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
  }
  async findOrNotFoundFail(id: number): Promise<GameSession> {
    const gameSession = await this.findById(id);

    if (!gameSession) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        extensions: [
          {
            field: 'game session',
            message: 'game session not found',
          },
        ],
        message: 'game session not found',
      });
    }

    return gameSession;
  }

  async findActiveGameSessionByUserId(
    userId: number,
  ): Promise<GameSession | null> {
    return await this.gameSessionsOrmRepository.findOne({
      where: {
        deletedAt: IsNull(),
        winner_id: IsNull(),
        session_started_at: Not(IsNull()),
        participants: {
          user: {
            id: userId,
          },
        },
      },
      relations: {
        participants: {
          user: true,
        },
      },
    });
  }
  async findPendingSecondUserGameSession() {
    return await this.gameSessionsOrmRepository.findOne({
      where: {
        deletedAt: IsNull(),
        session_started_at: IsNull(),
        winner_id: IsNull(),
      },
    });
  }

  async save(
    gameSession: Omit<GameSession, 'id'> & { id?: number },
  ): Promise<number> {
    const result = await this.gameSessionsOrmRepository.save(gameSession);

    return result.id;
  }
}
