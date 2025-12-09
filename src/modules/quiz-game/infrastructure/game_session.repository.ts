import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
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

  async updateWinner(sessionId: number, winnerId: number): Promise<void> {
    try {
      await this.gameSessionsOrmRepository.update(sessionId, {
        winner_id: winnerId,
      });

      console.log('Winner updated successfully', winnerId);
    } catch (err) {
      console.error('Update error:', err);
    }
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
    const qb = this.gameSessionsOrmRepository
      .createQueryBuilder('gameSession')
      .leftJoinAndSelect('gameSession.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'user')
      .where('gameSession.deletedAt IS NULL')
      .andWhere('gameSession.session_started_at IS NOT NULL')
      .andWhere('gameSession.winner_id IS NULL')
      .andWhere('user.id = :userId', { userId });

    return await qb.getOne();
  }
  async findPendingSecondUserGameSession() {
    try {
      return await this.gameSessionsOrmRepository.findOne({
        where: {
          deletedAt: IsNull(),
          session_started_at: IsNull(),
          winner_id: IsNull(),
        },
      });
    } catch (err) {
      console.error('FindOne error:', err);
    }
  }

  async save(
    gameSession: Omit<GameSession, 'id'> & { id?: number },
  ): Promise<number> {
    const result = await this.gameSessionsOrmRepository.save(gameSession);

    return result.id;
  }
}
