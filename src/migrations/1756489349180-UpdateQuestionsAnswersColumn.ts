import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateQuestionsAnswersColumn1756489349180
  implements MigrationInterface
{
  name = 'UpdateQuestionsAnswersColumn1756489349180';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Questions" DROP COLUMN "answers"`);
    await queryRunner.query(
      `ALTER TABLE "Questions" ADD "answers" text array NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Questions" DROP COLUMN "answers"`);
    await queryRunner.query(
      `ALTER TABLE "Questions" ADD "answers" json array NOT NULL`,
    );
  }
}
