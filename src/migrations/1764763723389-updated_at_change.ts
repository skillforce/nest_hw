import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatedAtChange1764763723389 implements MigrationInterface {
  name = 'UpdatedAtChange1764763723389';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "PasswordRecoveryConfirmations" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PasswordRecoveryConfirmations" ADD "updatedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "EmailConfirmations" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "EmailConfirmations" ADD "updatedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserSessions" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserSessions" ADD "updatedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "Blogs" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "Blogs" ADD "updatedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "Posts" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "Posts" ADD "updatedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "Comments" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "Comments" ADD "updatedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "Likes" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "Likes" ADD "updatedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestionAnswers" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestionAnswers" ADD "updatedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionParticipants" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionParticipants" ADD "updatedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "Users" ADD "updatedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessions" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessions" ADD "updatedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestions" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestions" ADD "updatedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "Questions" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "Questions" ADD "updatedAt" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Questions" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "Questions" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestions" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestions" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessions" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessions" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "Users" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionParticipants" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionParticipants" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestionAnswers" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestionAnswers" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "Likes" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "Likes" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "Comments" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "Comments" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "Posts" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "Posts" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "Blogs" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "Blogs" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserSessions" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserSessions" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "EmailConfirmations" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "EmailConfirmations" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "PasswordRecoveryConfirmations" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "PasswordRecoveryConfirmations" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }
}
