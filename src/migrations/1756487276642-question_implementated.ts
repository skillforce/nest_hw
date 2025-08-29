import { MigrationInterface, QueryRunner } from 'typeorm';

export class QuestionImplementated1756487276642 implements MigrationInterface {
  name = 'QuestionImplementated1756487276642';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "Questions" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "questionBody" character varying NOT NULL, "answers" json array NOT NULL, "isPublished" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_8f81bcc6305787ab7dd0d828e21" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "Questions"`);
  }
}
