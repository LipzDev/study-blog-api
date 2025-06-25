import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserRoleEnum1734380000000 implements MigrationInterface {
  name = 'UpdateUserRoleEnum1734380000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Atualizar o tipo enum para incluir SUPER_ADMIN
    await queryRunner.query(`
      ALTER TYPE "user_role_enum" ADD VALUE 'super_admin';
    `);

    // Remover a coluna is_super_admin
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "is_super_admin";
    `);

    // Definir o primeiro usuário como SUPER_ADMIN
    await queryRunner.query(`
      UPDATE "users" 
      SET "role" = 'super_admin' 
      WHERE "id" = (
        SELECT "id" FROM "users" 
        ORDER BY "createdAt" ASC 
        LIMIT 1
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Adicionar de volta a coluna is_super_admin
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "is_super_admin" boolean NOT NULL DEFAULT false;
    `);

    // Definir SUPER_ADMIN como is_super_admin = true
    await queryRunner.query(`
      UPDATE "users" 
      SET "is_super_admin" = true 
      WHERE "role" = 'super_admin';
    `);

    // Remover o valor 'super_admin' do enum (isso pode falhar se houver dados)
    // await queryRunner.query(`
    //   ALTER TYPE "user_role_enum" DROP VALUE 'super_admin';
    // `);
  }
}
