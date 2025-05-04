export class CreatePostDomainDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  createdAt?: string;
  blogName: string;
}

export class UpdatePostDomainDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  blogName: string;
}
