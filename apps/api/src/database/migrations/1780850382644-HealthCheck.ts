import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Throwaway migration that proves the generate → run → revert loop end-to-end.
 * It introduces no application schema; the `health_check` table exists only to
 * exercise the workflow and give S-01+ a non-empty migrations directory to
 * follow. Safe to drop once real schema migrations land.
 */
export class HealthCheck1780850382644 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "health_check" (
        "id" SERIAL PRIMARY KEY,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "health_check"`);
  }
}
