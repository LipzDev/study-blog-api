import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSuperAdminField1734375600000 implements MigrationInterface {
  name = 'AddSuperAdminField1734375600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar coluna is_super_admin
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "is_super_admin" boolean NOT NULL DEFAULT false
    `);

    // Definir o primeiro usuário (mais antigo) como super admin
    await queryRunner.query(`
      UPDATE "users" 
      SET "is_super_admin" = true, "role" = 'admin'
      WHERE "id" = (
        SELECT "id" FROM "users" 
        ORDER BY "createdAt" ASC 
        LIMIT 1
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover coluna is_super_admin
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "is_super_admin"
    `);
  }
}
