import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { BlogsSortBy } from './blogs-sort-by';

export class GetBlogsQueryParams extends BaseQueryParams {
  sortBy: BlogsSortBy;
  searchNameTerm: string | null;

  constructor() {
    super();
    this.sortBy = BlogsSortBy.CreatedAt;
    this.searchNameTerm = null;
  }
}
