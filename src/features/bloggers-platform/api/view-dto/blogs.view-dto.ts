import { BlogDocument } from '../../domain/blog.entity';

export class BlogsViewDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;

  static mapToViewDto(blog: BlogDocument): BlogsViewDto {
    const dto = new BlogsViewDto();

    dto.id = blog._id.toString();
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.websiteUrl;
    dto.isMembership = blog.isMembership;
    dto.createdAt = blog.createdAt ?? new Date();

    return dto;
  }
}
