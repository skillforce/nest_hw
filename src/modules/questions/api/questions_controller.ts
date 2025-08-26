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

@SkipThrottle()
@Controller('sa/quiz/questions')
export class QuestionsController {
  constructor() {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async getAllPaginatedQuestions(
    @Query() query: GetQuestionsQueryParams,
  ): Promise<PaginatedViewDto<QuestionViewDto[]>> {}

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createQuestion(
    @Body() body: CreateQuestionInputDto,
  ): Promise<QuestionViewDto> {}

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async updateQuestionById(
    @Param() { id }: IdNumberParamDto,
    @Body() body: UpdateQuestionByIdInputDto,
  ): Promise<void> {}

  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/publish')
  async publishQuestionById(
    @Body() body: PublishQuestionByIdInputDto,
    @Param() { id }: IdNumberParamDto,
  ): Promise<void> {}

  @ApiParam({ name: 'id' })
  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestionById(@Param() { id }: IdNumberParamDto): Promise<void> {}
}
