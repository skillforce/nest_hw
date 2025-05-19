export const titleConstraints = {
  minLength: 1,
  maxLength: 30,
};
export const shortDescriptionConstraints = {
  minLength: 1,
  maxLength: 100,
};
export const contentConstraints = {
  minLength: 1,
  maxLength: 1000,
};

export class Post {
  id: number;
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  deletedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
