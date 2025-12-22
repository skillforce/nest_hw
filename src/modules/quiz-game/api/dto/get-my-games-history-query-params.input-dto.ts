import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';

export enum GetMyGamesHistorySortBy {
  pairCreatedDate = 'pairCreatedDate',
  startGameDate = 'startGameDate',
  finishGameDate = 'finishGameDate',
}

export class GetMyGamesHistoryQueryParamsInputDto extends BaseQueryParams {
  sortBy: GetMyGamesHistorySortBy.pairCreatedDate;

  constructor() {
    super();
    this.sortBy = GetMyGamesHistorySortBy.pairCreatedDate;
  }
}
