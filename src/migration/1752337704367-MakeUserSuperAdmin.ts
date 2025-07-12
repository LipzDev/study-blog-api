import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeUserSuperAdmin1752337704367 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE users
            SET role = 'super_admin'
            WHERE email = 'contato.devweb@hotmail.com';
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE users
            SET role = 'user'
            WHERE email = 'contato.devweb@hotmail.com' AND role = 'super_admin';
        `);
  }
}
