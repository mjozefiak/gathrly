import { ServiceUnavailableException } from '@nestjs/common';
import type { DataSource } from 'typeorm';
import { describe, expect, it } from 'vitest';
import { AppService } from './app.service';

// Build an AppService over a stubbed DataSource whose `query` resolves or
// rejects — exercises the /health gating without a real DB connection.
const serviceWithQuery = (query: () => Promise<unknown>) =>
  new AppService({ query } as unknown as DataSource);

describe('AppService.getHealth', () => {
  it('returns { status: ok, db: ok } when SELECT 1 resolves', async () => {
    const service = serviceWithQuery(() => Promise.resolve([{ '?column?': 1 }]));
    await expect(service.getHealth()).resolves.toEqual({ status: 'ok', db: 'ok' });
  });

  it('gates with a 503 ServiceUnavailableException and db: down when the query rejects', async () => {
    const service = serviceWithQuery(() =>
      Promise.reject(new Error('connection refused')),
    );

    const error = await service.getHealth().then(
      () => {
        throw new Error('expected getHealth to reject');
      },
      (e: unknown) => e,
    );

    expect(error).toBeInstanceOf(ServiceUnavailableException);
    const exception = error as ServiceUnavailableException;
    expect(exception.getStatus()).toBe(503);
    expect(exception.getResponse()).toEqual({ status: 'error', db: 'down' });
  });
});
