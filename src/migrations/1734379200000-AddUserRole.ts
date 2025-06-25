import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRole1734379200000 implements MigrationInterface {
  name = 'AddUserRole1734379200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar o tipo enum se não existir
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "user_role_enum" AS ENUM('user', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Adicionar a coluna role com valor padrão 'user'
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "role" "user_role_enum" NOT NULL DEFAULT 'user'
    `);

    // Opcional: Definir o primeiro usuário como admin (se existir)
    await queryRunner.query(`
      UPDATE "users" 
      SET "role" = 'admin' 
      WHERE "id" = (
        SELECT "id" FROM "users" 
        ORDER BY "createdAt" ASC 
        LIMIT 1
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover a coluna role
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);

    // Remover o tipo enum
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
  }
}
