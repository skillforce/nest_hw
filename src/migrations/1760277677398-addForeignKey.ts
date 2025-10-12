import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForeignKey1760277677398 implements MigrationInterface {
  name = 'AddForeignKey1760277677398';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestionAnswers" ADD CONSTRAINT "FK_31f9cd1d4cd5bc1d0179e247e45" FOREIGN KEY ("game_session_question_id") REFERENCES "GameSessionQuestions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestionAnswers" DROP CONSTRAINT "FK_31f9cd1d4cd5bc1d0179e247e45"`,
    );
  }
}
