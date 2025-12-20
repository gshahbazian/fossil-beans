import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    ENCRYPTION_KEY: z.string().min(32),
    NBA_GAME_LOG_URL: z
      .url()
      .optional()
      .default('https://stats.nba.com/stats/leaguegamelog'),
    NBA_BOX_SCORE_URL: z
      .url()
      .optional()
      .default('https://cdn.nba.com/static/json/liveData/boxscore'),
    NBA_SCOREBOARD_URL: z
      .url()
      .optional()
      .default(
        'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json'
      ),
  },
  client: {
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    NBA_GAME_LOG_URL: process.env.NBA_GAME_LOG_URL,
    NBA_BOX_SCORE_URL: process.env.NBA_BOX_SCORE_URL,
    NBA_SCOREBOARD_URL: process.env.NBA_SCOREBOARD_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})
