import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateWinnerId1764593277219 implements MigrationInterface {
  name = 'UpdateWinnerId1764593277219';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestionAnswers" DROP CONSTRAINT "FK_a7aeb9545432f42656bb59b0ba7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestionAnswers" ALTER COLUMN "participant_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionParticipants" ALTER COLUMN "score" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionParticipants" ALTER COLUMN "score" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestionAnswers" ADD CONSTRAINT "FK_a7aeb9545432f42656bb59b0ba7" FOREIGN KEY ("participant_id") REFERENCES "GameSessionParticipants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestionAnswers" DROP CONSTRAINT "FK_a7aeb9545432f42656bb59b0ba7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionParticipants" ALTER COLUMN "score" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionParticipants" ALTER COLUMN "score" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestionAnswers" ALTER COLUMN "participant_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestionAnswers" ADD CONSTRAINT "FK_a7aeb9545432f42656bb59b0ba7" FOREIGN KEY ("participant_id") REFERENCES "GameSessionParticipants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
