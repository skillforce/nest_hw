import { MigrationInterface, QueryRunner } from 'typeorm';

export class QuizMainTables1757252484181 implements MigrationInterface {
  name = 'QuizMainTables1757252484181';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "GameSessionQuestions" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "order_index" integer NOT NULL, "question_id" integer NOT NULL, "game_session_id" integer NOT NULL, CONSTRAINT "PK_e835ae8ab88de387c4c5ac3b87e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."GameSessionQuestionAnswers_answer_status_enum" AS ENUM('correct', 'incorrect', 'pending')`,
    );
    await queryRunner.query(
      `CREATE TABLE "GameSessionQuestionAnswers" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "game_session_question_id" integer NOT NULL, "answer" character varying, "answer_status" "public"."GameSessionQuestionAnswers_answer_status_enum" NOT NULL DEFAULT 'pending', "participant_id" integer, CONSTRAINT "PK_eaa07742ee6467538dbf2f540bd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "GameSessionParticipants" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "finished_at" TIMESTAMP, "score" integer, "game_session_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_a8f160bf5949f3e1f0759fb4c72" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "GameSessions" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "id" SERIAL NOT NULL, "session_started_at" TIMESTAMP, "winner_id" integer, CONSTRAINT "PK_3d3de09eac503cb5dab1e8837be" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestions" ADD CONSTRAINT "FK_536e8bafed7222a216bc8ae729f" FOREIGN KEY ("question_id") REFERENCES "Questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestions" ADD CONSTRAINT "FK_78643d8f23b21bfad0a8d7d5e7c" FOREIGN KEY ("game_session_id") REFERENCES "GameSessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestionAnswers" ADD CONSTRAINT "FK_a7aeb9545432f42656bb59b0ba7" FOREIGN KEY ("participant_id") REFERENCES "GameSessionParticipants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionParticipants" ADD CONSTRAINT "FK_e8689b62a54942111664459691c" FOREIGN KEY ("game_session_id") REFERENCES "GameSessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionParticipants" ADD CONSTRAINT "FK_2c830b6e1a20ca1d96def3239ac" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessions" ADD CONSTRAINT "FK_8a42e2932fea3c3d50d709de4e3" FOREIGN KEY ("winner_id") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "GameSessions" DROP CONSTRAINT "FK_8a42e2932fea3c3d50d709de4e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionParticipants" DROP CONSTRAINT "FK_2c830b6e1a20ca1d96def3239ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionParticipants" DROP CONSTRAINT "FK_e8689b62a54942111664459691c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestionAnswers" DROP CONSTRAINT "FK_a7aeb9545432f42656bb59b0ba7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestions" DROP CONSTRAINT "FK_78643d8f23b21bfad0a8d7d5e7c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessionQuestions" DROP CONSTRAINT "FK_536e8bafed7222a216bc8ae729f"`,
    );
    await queryRunner.query(`DROP TABLE "GameSessions"`);
    await queryRunner.query(`DROP TABLE "GameSessionParticipants"`);
    await queryRunner.query(`DROP TABLE "GameSessionQuestionAnswers"`);
    await queryRunner.query(
      `DROP TYPE "public"."GameSessionQuestionAnswers_answer_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "GameSessionQuestions"`);
  }
}
