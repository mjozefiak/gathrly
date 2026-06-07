import { join } from 'node:path';
import { DataSource, DataSourceOptions } from 'typeorm';

/**
 * Framework-free TypeORM configuration.
 *
 * This module is the single source of truth for the database connection,
 * shared by the Nest application (via `TypeOrmModule.forRootAsync`) and the
 * standalone TypeORM CLI used for migrations. It MUST stay free of any
 * `@nestjs/*` imports and path aliases so it can be compiled and executed
 * on its own by the migration CLI in production.
 *
 * Schema only ever changes through reviewed migration files: `synchronize`
 * and `migrationsRun` are permanently off.
 */
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
  migrationsRun: false,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

export default new DataSource(dataSourceOptions);
