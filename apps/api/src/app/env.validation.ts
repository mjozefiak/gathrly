import * as Joi from 'joi';

/**
 * Environment validation schema consumed by `ConfigModule.forRoot`.
 *
 * A misconfigured deploy must fail loudly at boot rather than later at
 * connect time, so `DATABASE_URL` is required and must be a postgres URI.
 */
export const validationSchema = Joi.object({
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required(),
  PORT: Joi.number().default(3000),
  DATABASE_SSL: Joi.boolean().default(false),
});
