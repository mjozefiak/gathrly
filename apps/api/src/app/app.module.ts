import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '../database/data-source';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validationSchema } from './env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Env vars are provided by the runtime (Nx for `nx serve`, `node
      // --env-file` for run/migration paths, Railway in prod). ConfigModule's
      // job here is validation, not loading — so a stray .env on disk can
      // never mask a missing DATABASE_URL.
      ignoreEnvFile: true,
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => dataSourceOptions,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
