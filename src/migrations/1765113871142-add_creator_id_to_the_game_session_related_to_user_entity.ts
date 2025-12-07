import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatorIdToTheGameSessionRelatedToUserEntity1765113871142
  implements MigrationInterface
{
  name = 'AddCreatorIdToTheGameSessionRelatedToUserEntity1765113871142';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "GameSessions" ADD "creator_user_id" integer`,
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
      `ALTER TABLE "GameSessions" DROP COLUMN "creator_user_id"`,
    );
  }
}
