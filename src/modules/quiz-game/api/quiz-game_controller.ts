import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import {
  AnswerQuestionViewDto,
  GameSessionViewDto,
} from './dto/game-session-view-dto';
import { ExtractUserFromRequest } from '../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../user-accounts/guards/dto/user-context.dto';
import { AnswerQuestionInputDto } from './dto/game-session-input-dto';
import { GetMyCurrentPairCommand } from '../application/usecases/get-my-current-pair.usecase';
import { IdNumberParamDto } from '../../../core/decorators/validation/objectIdDto';
import { GetGameSessionByIdCommand } from '../application/usecases/get-game-session-by-id.usecase';
import { ConnectUserToTheQuizGameCommand } from '../application/usecases/connect-user-to-the-quiz-game.usecase';
import { AnswerQuestionCommand } from '../application/usecases/answer-quiz-game-question.usecase';
import { GameStatisticsViewDto } from './dto/game-statistics-view-dto';
import { GetMyStatisticCommand } from '../application/usecases/get-my-statistic.usecase';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { GetMyGamesHistoryQueryParamsInputDto } from './dto/get-my-games-history-query-params.input-dto';
import { GetMyGamesHistoryCommand } from '../application/usecases/get-my-games-history.usecase';

@SkipThrottle()
@Controller('/pair-game-quiz/pairs')
export class QuizGameController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('/my-current')
  @UseGuards(JwtAuthGuard)
  async getMyCurrentGameSession(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GameSessionViewDto> {
    return await this.commandBus.execute<
      GetMyCurrentPairCommand,
      GameSessionViewDto
    >(new GetMyCurrentPairCommand(user.id));
  }

  @Get('/my')
  @UseGuards(JwtAuthGuard)
  async getMyGamesHistorySession(
    @ExtractUserFromRequest() user: UserContextDto,
    @Query() query: GetMyGamesHistoryQueryParamsInputDto,
  ): Promise<PaginatedViewDto<GameSessionViewDto[]>> {
    try {
      return await this.commandBus.execute<
        GetMyGamesHistoryCommand,
        PaginatedViewDto<GameSessionViewDto[]>
      >(new GetMyGamesHistoryCommand(user.id, query));
    } catch (error) {
      console.error('Error in getMyGamesHistorySession:', error);
      throw error;
    }
  }

  @Get('/my-statistic')
  @UseGuards(JwtAuthGuard)
  async getMyStatistics(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GameStatisticsViewDto> {
    return await this.commandBus.execute<
      GetMyStatisticCommand,
      GameStatisticsViewDto
    >(new GetMyStatisticCommand(user.id));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getGameSessionById(
    @Param() { id }: IdNumberParamDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GameSessionViewDto> {
    return await this.commandBus.execute<
      GetGameSessionByIdCommand,
      GameSessionViewDto
    >(new GetGameSessionByIdCommand(id, user.id));
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/connection')
  async connectToGameSession(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<any> {
    const gameSessionId = await this.commandBus.execute<
      ConnectUserToTheQuizGameCommand,
      number
    >(new ConnectUserToTheQuizGameCommand(user.id));
    return await this.commandBus.execute<
      GetGameSessionByIdCommand,
      GameSessionViewDto
    >(new GetGameSessionByIdCommand(gameSessionId, user.id));
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/my-current/answers')
  async answerGameSessionQuestion(
    @Body() body: AnswerQuestionInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<AnswerQuestionViewDto> {
    return await this.commandBus.execute<
      AnswerQuestionCommand,
      AnswerQuestionViewDto
    >(new AnswerQuestionCommand(body, user.id));
  }
}
