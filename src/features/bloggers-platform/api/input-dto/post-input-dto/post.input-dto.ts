export class CreatePostInputDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export class CreatePostByBlogIdInputDto {
  title: string;
  shortDescription: string;
  content: string;
}

export class UpdatePostInputDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}
