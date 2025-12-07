import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateQuestionAnswerEnum1765117966886
  implements MigrationInterface
{
  name = 'UpdateQuestionAnswerEnum1765117966886';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."GameSessionQuestionAnswers_answer_status_enum" RENAME TO "GameSessionQuestionAnswers_answer_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."GameSessionQuestionAnswers_answer_status_enum" AS ENUM('Correct', 'Incorrect', 'Pending')`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestionAnswers" ALTER COLUMN "answer_status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestionAnswers" ALTER COLUMN "answer_status" TYPE "public"."GameSessionQuestionAnswers_answer_status_enum" USING "answer_status"::"text"::"public"."GameSessionQuestionAnswers_answer_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestionAnswers" ALTER COLUMN "answer_status" SET DEFAULT 'Pending'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."GameSessionQuestionAnswers_answer_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessions" DROP CONSTRAINT "FK_79ad706ff78e73592878a1ec1f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessions" ALTER COLUMN "creator_user_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessions" ADD CONSTRAINT "FK_79ad706ff78e73592878a1ec1f0" FOREIGN KEY ("creator_user_id") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "GameSessions" DROP CONSTRAINT "FK_79ad706ff78e73592878a1ec1f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessions" ALTER COLUMN "creator_user_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessions" ADD CONSTRAINT "FK_79ad706ff78e73592878a1ec1f0" FOREIGN KEY ("creator_user_id") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."GameSessionQuestionAnswers_answer_status_enum_old" AS ENUM('correct', 'incorrect', 'pending')`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestionAnswers" ALTER COLUMN "answer_status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestionAnswers" ALTER COLUMN "answer_status" TYPE "public"."GameSessionQuestionAnswers_answer_status_enum_old" USING "answer_status"::"text"::"public"."GameSessionQuestionAnswers_answer_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestionAnswers" ALTER COLUMN "answer_status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."GameSessionQuestionAnswers_answer_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."GameSessionQuestionAnswers_answer_status_enum_old" RENAME TO "GameSessionQuestionAnswers_answer_status_enum"`,
    );
  }
}
