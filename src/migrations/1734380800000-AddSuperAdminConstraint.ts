import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSuperAdminConstraint1734380800000 implements MigrationInterface {
  name = 'AddSuperAdminConstraint1734380800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar constraint única para garantir apenas 1 SUPER_ADMIN
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_super_admin_unique" 
      ON "users" ("role") 
      WHERE "role" = 'super_admin'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover a constraint
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_super_admin_unique"`);
  }
} 