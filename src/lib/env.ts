import { z } from 'zod'

const envSchema = z.object({
  PROD: z.boolean(),
  VITE_POSTHOG_HOST: z.string().optional(),
  VITE_POSTHOG_KEY: z.string().optional(),
})

export const env = envSchema.parse(import.meta.env)

export type Env = z.infer<typeof envSchema>
