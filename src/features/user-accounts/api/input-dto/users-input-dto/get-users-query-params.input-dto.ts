import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { UsersSortBy } from './users-sort-by';

export class GetUsersQueryParams extends BaseQueryParams {
  sortBy: UsersSortBy;
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;

  constructor() {
    super();
    this.sortBy = UsersSortBy.CreatedAt;
    this.searchLoginTerm = null;
    this.searchEmailTerm = null;
  }
}
