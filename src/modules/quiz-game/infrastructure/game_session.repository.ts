import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { GameSession } from '../domain/game-session.entity';
import {
  GetMyGamesHistoryQueryParamsInputDto,
  GetMyGamesHistorySortBy,
} from '../api/dto/get-my-games-history-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';

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
      relations: ['participants'],
    });
  }

  async getUserWinsAndLosesCount(
    gameSessionsIds: number[],
    userId: number,
  ): Promise<{
    winsCount: number;
    lossesCount: number;
  }> {
    const result = await this.gameSessionsOrmRepository
      .createQueryBuilder('gs')
      .leftJoin('gs.participants', 'gsp')
      .select(
        'SUM(CASE WHEN gs.winner_id = gsp.user_id THEN 1 ELSE 0 END)',
        'winsCount',
      )
      .addSelect(
        'SUM(CASE WHEN gs.winner_id IS NOT NULL AND gs.winner_id != gsp.user_id THEN 1 ELSE 0 END)',
        'losesCount',
      )
      .where('gs.id IN (:...gameSessionsIds)', { gameSessionsIds })
      .andWhere('gsp.user_id = :userId', { userId })

      .getRawOne();
    return {
      winsCount: Number(result.winsCount || 0),
      lossesCount: Number(result.losesCount || 0),
    };
  }
  async findAllByUserId(
    userId: number,
    query: GetMyGamesHistoryQueryParamsInputDto,
  ): Promise<PaginatedViewDto<GameSession[] | null>> {
    const sortDirection =
      query.sortDirection?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const SORT_BY_MAP: Record<GetMyGamesHistorySortBy, string> = {
      [GetMyGamesHistorySortBy.pairCreatedDate]: 'gs.createdAt',
      [GetMyGamesHistorySortBy.startGameDate]: 'gs.session_started_at',
      [GetMyGamesHistorySortBy.finishGameDate]: 'gsp.finished_at',
      [GetMyGamesHistorySortBy.status]: 'game_status_sort',
    };

    const sortByColumn = SORT_BY_MAP[query.sortBy];

    const skip = query.calculateSkip();
    const take = query.pageSize;

    const qb = this.gameSessionsOrmRepository
      .createQueryBuilder('gs')
      .addSelect(
        `
  CASE
    WHEN gs.winner_id IS NULL THEN 0
    ELSE 1
  END
  `,
        'game_status_sort',
      )
      .leftJoinAndSelect('gs.participants', 'gsp')
      .leftJoinAndSelect('gsp.user', 'participantUser')
      .leftJoinAndSelect('gsp.gameSessionQuestionAnswers', 'gspAnswers')
      .leftJoinAndSelect('gspAnswers.gameSessionQuestion', 'gsq')
      .leftJoinAndSelect('gsq.question', 'answeredQuestion')
      .leftJoinAndSelect('gs.questions', 'gsQuestions')
      .leftJoinAndSelect('gsQuestions.question', 'question')
      .where('gs.deletedAt IS NULL')
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('1')
          .from('GameSessionParticipants', 'gsp2')
          .where('gsp2.game_session_id = gs.id')
          .andWhere('gsp2.user_id = :userId')
          .getQuery();

        return `EXISTS ${subQuery}`;
      })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('COUNT(*)')
          .from('GameSessionParticipants', 'gsp3')
          .where('gsp3.game_session_id = gs.id')
          .andWhere('gsp3.deletedAt IS NULL')
          .getQuery();

        return `${subQuery} = 2`;
      })
      .setParameter('userId', userId)
      .orderBy(sortByColumn, sortDirection)
      .addOrderBy('gs.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    const [sessions, totalCount] = await qb.distinct(true).getManyAndCount();

    return PaginatedViewDto.mapToView({
      items: sessions,
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
    });
  }

  async updateWinner(sessionId: number, winnerId: number): Promise<void> {
    try {
      await this.gameSessionsOrmRepository.update(sessionId, {
        winner_id: winnerId,
      });
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
