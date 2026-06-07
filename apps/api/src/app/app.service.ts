import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  /**
   * Readiness probe: a live `SELECT 1` against the DB. On success returns
   * `{ status: 'ok', db: 'ok' }` (HTTP 200). On failure it throws
   * `ServiceUnavailableException` so the endpoint *gates* with HTTP 503 and a
   * `{ status: 'error', db: 'down' }` body — a load balancer pointed at
   * `/api/health` then actually fails a DB-broken release instead of treating
   * it as healthy.
   */
  async getHealth(): Promise<{ status: string; db: string }> {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok', db: 'ok' };
    } catch {
      throw new ServiceUnavailableException({ status: 'error', db: 'down' });
    }
  }
}
