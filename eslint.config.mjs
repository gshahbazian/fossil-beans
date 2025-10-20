import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'
import pluginDrizzle from 'eslint-plugin-drizzle'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [{
  ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]
}, ...compat.extends(
  'next/core-web-vitals',
  'next/typescript',
  'plugin:drizzle/recommended'
), {
  plugins: {
    drizzle: pluginDrizzle,
  },
}]

export default eslintConfig
