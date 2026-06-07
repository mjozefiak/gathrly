import { describe, expect, it } from 'vitest';
import { validationSchema } from './env.validation';

// Validate the Joi schema directly (no full Nest bootstrap) — asserts the
// fail-fast config behavior the plan's end state promises. allowUnknown mirrors
// ConfigModule's defaults so the ambient process.env keys don't trip validation.
const validate = (env: Record<string, unknown>) =>
  validationSchema.validate(env, { allowUnknown: true });

describe('env validationSchema', () => {
  it('rejects a missing DATABASE_URL', () => {
    const { error } = validate({ PORT: '3000' });
    expect(error).toBeDefined();
    expect(error?.message).toMatch(/DATABASE_URL/);
  });

  it('accepts a valid postgres DATABASE_URL and applies defaults', () => {
    const { error, value } = validate({
      DATABASE_URL: 'postgresql://gathrly:gathrly@localhost:5432/gathrly',
    });
    expect(error).toBeUndefined();
    expect(value.PORT).toBe(3000);
    expect(value.DATABASE_SSL).toBe(false);
  });

  it('rejects a DATABASE_URL with a non-postgres scheme', () => {
    const { error } = validate({ DATABASE_URL: 'mysql://localhost:3306/db' });
    expect(error).toBeDefined();
    expect(error?.message).toMatch(/DATABASE_URL/);
  });
});
