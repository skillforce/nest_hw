import { Injectable } from '@nestjs/common';
import { Blog } from '../domain/blog.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findById(id: string): Promise<Blog | null> {
    const query =
      'SELECT * FROM "Blogs" WHERE "id" = $1 AND "deletedAt" IS NULL';
    const result = await this.dataSource.query<Blog[]>(query, [id]);

    return result[0] ?? null;
  }
  async findOrNotFoundFail(id: string): Promise<Blog> {
    const blog = await this.findById(id);

    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: `Blog with id ${id} not found`,
        extensions: [
          {
            field: 'blog',
            message: `Blog with id ${id} not found`,
          },
        ],
      });
    }

    return blog;
  }

  async save(blog: Omit<Blog, 'id'> & { id?: number }): Promise<number> {
    let query: string;
    let values: any[];

    const hasId = !!blog.id;

    if (hasId) {
      query = `
      INSERT INTO "Blogs" ("id", "name", "description", "websiteUrl", "deletedAt")
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("id") DO UPDATE SET
        "name" = EXCLUDED."name",
        "description" = EXCLUDED."description",
        "websiteUrl" = EXCLUDED."websiteUrl",
        "deletedAt" = EXCLUDED."deletedAt"
        RETURNING "id";
    `;
      values = [
        blog.id,
        blog.name,
        blog.description,
        blog.websiteUrl,
        blog.deletedAt ?? null,
      ];
    } else {
      query = `
      INSERT INTO "Blogs" ( "name", "description", "websiteUrl", "deletedAt")
      VALUES ($1, $2, $3, $4)
      RETURNING "id";
    `;
      values = [
        blog.name,
        blog.description,
        blog.websiteUrl,
        blog.deletedAt ?? null,
      ];
    }

    const result = await this.dataSource.query<Blog[]>(query, values);

    return result[0].id;
  }
}
