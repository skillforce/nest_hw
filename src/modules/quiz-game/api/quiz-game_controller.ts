import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { GetQuestionsQueryParams } from './dto/question-input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
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

@SkipThrottle()
@Controller('/pair-game-quiz/pairs')
export class QuizGameController {
  constructor(
    // private readonly questionsQueryRepository: QuestionsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getGameSessionById(
    @Query() query: GetQuestionsQueryParams,
  ): Promise<PaginatedViewDto<GameSessionViewDto[]>> {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/connection')
  async connectToGameSession(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GameSessionViewDto> {
    console.log(user);
    return {};
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/my-current/answers')
  async answerGameSessionQuestion(
    @Body() body: AnswerQuestionInputDto,
  ): Promise<AnswerQuestionViewDto> {
    console.log(body.answer);
    return {};
  }
}
