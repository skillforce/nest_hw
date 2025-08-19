import { MigrationInterface, QueryRunner } from 'typeorm';

export class Update1755606913133 implements MigrationInterface {
  name = 'Update1755606913133';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "Comments" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "content" character varying NOT NULL, "postId" integer NOT NULL, "creatorId" integer NOT NULL, CONSTRAINT "PK_91e576c94d7d4f888c471fb43de" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `SELECT "id", "parentId" FROM "Likes" WHERE "parentId" IS NULL OR "parentId" !~ '^\\d+$'`,
    );
    await queryRunner.query(
      `DELETE FROM "Likes" WHERE "parentId" IS NULL OR "parentId" !~ '^\\d+$'`,
    );

    await queryRunner.query(
      `ALTER TABLE "Likes" ALTER COLUMN "parentId" TYPE integer USING "parentId"::integer;`,
    );

    await queryRunner.query(
      `ALTER TABLE "Likes" ALTER COLUMN "parentId" SET NOT NULL;`,
    );

    await queryRunner.query(
      `ALTER TABLE "Comments" ADD CONSTRAINT "FK_68844d71da70caf0f0f4b0ed72d" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Comments" ADD CONSTRAINT "FK_7eb7c19357fe03099732cbe5be3" FOREIGN KEY ("creatorId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `SELECT "id", "userId" FROM "Likes" WHERE "userId" IS NOT NULL AND "userId" NOT IN (SELECT "id" FROM "Users");`,
    );
    await queryRunner.query(
      `DELETE FROM "Likes"  WHERE "userId" IS NOT NULL AND "userId" NOT IN (SELECT "id" FROM "Users");`,
    );
    await queryRunner.query(
      `ALTER TABLE "Likes" ADD CONSTRAINT "FK_eb14edaf42c147177b6f90ebf0c" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Likes" DROP CONSTRAINT "FK_eb14edaf42c147177b6f90ebf0c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Comments" DROP CONSTRAINT "FK_7eb7c19357fe03099732cbe5be3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Comments" DROP CONSTRAINT "FK_68844d71da70caf0f0f4b0ed72d"`,
    );
    await queryRunner.query(`ALTER TABLE "Likes" DROP COLUMN "parentId"`);
    await queryRunner.query(
      `ALTER TABLE "Likes" ADD "parentId" character varying NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "Comments"`);
  }
}
