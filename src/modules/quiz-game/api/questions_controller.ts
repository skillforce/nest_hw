import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { BasicAuthGuard } from '../../user-accounts/guards/basic/basic-auth.guard';
import {
  CreateQuestionInputDto,
  GetQuestionsQueryParams,
  PublishQuestionByIdInputDto,
  UpdateQuestionByIdInputDto,
} from './dto/question-input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { QuestionViewDto } from './dto/question-view-dto';
import { IdNumberParamDto } from '../../../core/decorators/validation/objectIdDto';
import { ApiParam } from '@nestjs/swagger';
import { QuestionsQueryRepository } from '../infrastructure/query/questions.query-repository';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../application/usecases/create-question.usecase';
import { UpdateQuestionCommand } from '../application/usecases/update-question.usecase';
import { UpdateQuestionPublishStatusCommand } from '../application/usecases/update-question-publish-status.usecase';
import { DeleteQuestionCommand } from '../application/usecases/delete-question.usecase';

@SkipThrottle()
@Controller('sa/quiz/questions')
export class QuestionsController {
  constructor(
    private readonly questionsQueryRepository: QuestionsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async getAllPaginatedQuestions(
    @Query() query: GetQuestionsQueryParams,
  ): Promise<PaginatedViewDto<QuestionViewDto[]> | undefined> {
    try {
      console.log(await this.questionsQueryRepository.getAll(query));
      return await this.questionsQueryRepository.getAll(query);
    } catch (error) {
      console.log('Error in getAllPaginatedQuestions:', error);
    }
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createQuestion(
    @Body() body: CreateQuestionInputDto,
  ): Promise<QuestionViewDto> {
    const createdQuestionId = await this.commandBus.execute<
      CreateQuestionCommand,
      number
    >(new CreateQuestionCommand(body));

    return this.questionsQueryRepository.findOrNotFoundFail(createdQuestionId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async updateQuestionById(
    @Param() { id }: IdNumberParamDto,
    @Body() body: UpdateQuestionByIdInputDto,
  ): Promise<void> {
    return await this.commandBus.execute<UpdateQuestionCommand, void>(
      new UpdateQuestionCommand(body, id),
    );
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/publish')
  async publishQuestionById(
    @Body() body: PublishQuestionByIdInputDto,
    @Param() { id }: IdNumberParamDto,
  ): Promise<void> {
    return await this.commandBus.execute<
      UpdateQuestionPublishStatusCommand,
      void
    >(new UpdateQuestionPublishStatusCommand(body, id));
  }

  @ApiParam({ name: 'id' })
  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestionById(@Param() { id }: IdNumberParamDto): Promise<void> {
    return await this.commandBus.execute<DeleteQuestionCommand, void>(
      new DeleteQuestionCommand(id),
    );
  }
}
