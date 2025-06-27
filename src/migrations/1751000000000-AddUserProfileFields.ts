import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserProfileFields1751000000000 implements MigrationInterface {
  name = 'AddUserProfileFields1751000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "bio" text`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "github" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "linkedin" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "twitter" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "instagram" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "instagram"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "twitter"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "linkedin"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "github"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bio"`);
  }
}
