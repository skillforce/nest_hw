import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGameStatus1767013933417 implements MigrationInterface {
  name = 'AddGameStatus1767013933417';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."GameSessions_status_enum" AS ENUM('PendingSecondPlayer', 'Active', 'Finished')`,
    );
    await queryRunner.query(
      `ALTER TABLE "GameSessions" ADD "status" "public"."GameSessions_status_enum" NOT NULL DEFAULT 'PendingSecondPlayer'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "GameSessions" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."GameSessions_status_enum"`);
  }
}
