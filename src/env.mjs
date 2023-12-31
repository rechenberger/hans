import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'test', 'production']),
    OPENAI_API_KEY: z.string(),
    REPLICATE_API_TOKEN: z.string(),
    SUPABASE_URL: z.string().url(),
    SUPABASE_API_KEY: z.string(),
    NEXT_PUBLIC_SUPABASE_API_KEY_PUBLIC: z.string(),
    DEFAULT_TEAMTOKEN_PER_UPSTREAM_CENT: z.number().min(1),
    TEAMTOKEN_BUDGET: z.number(),
    DISCORD_WEBHOOK_URL: z.string().url(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_DEV_MODE: z.boolean().optional(),
    // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
    NEXT_PUBLIC_DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE === 'true',
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_API_KEY: process.env.SUPABASE_API_KEY,
    DEFAULT_TEAMTOKEN_PER_UPSTREAM_CENT: parseInt(
      process.env.DEFAULT_TEAMTOKEN_PER_UPSTREAM_CENT || '0'
    ),
    NEXT_PUBLIC_SUPABASE_API_KEY_PUBLIC:
      process.env.NEXT_PUBLIC_SUPABASE_API_KEY_PUBLIC,
    TEAMTOKEN_BUDGET: parseInt(process.env.TEAMTOKEN_BUDGET || '0'),
    DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})
