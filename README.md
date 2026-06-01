# Fossil Beans

Sharable NBA box scores.

## Stack

- [TanStack Start](https://tanstack.com/start) (React, Vite)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) + [D1](https://developers.cloudflare.com/d1/)
- [Drizzle ORM](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com) + shadcn/ui

## Local development

1. Install deps:

   ```sh
   pnpm install
   ```

2. Create a local D1 database and apply migrations:

   ```sh
   pnpm db:migrate:local
   ```

   This uses the binding configured in `wrangler.jsonc` (name `fossil-beans`,
   binding `DB`) and stores data under `.wrangler/`.

3. Seed teams and today's games:

   ```sh
   pnpm seed:teams:local
   pnpm seed:games:local
   # or a specific PST date:
   ./scripts/insert-todays-games.sh --local 2025-01-15
   ```

4. Run the dev server:

   ```sh
   pnpm dev
   ```

   Open http://localhost:3000.

## Deploying to Cloudflare

1. Create the remote D1 database (one time):

   ```sh
   pnpm exec wrangler d1 create fossil-beans
   ```

   Copy the returned `database_id` into `wrangler.jsonc`
   (`d1_databases[0].database_id`).

2. Apply migrations and seed:

   ```sh
   pnpm db:migrate:remote
   pnpm seed:teams:remote
   pnpm seed:games:remote
   ```

3. Build and deploy:

   ```sh
   pnpm deploy
   ```

## Scripts

| Script                       | What it does                                         |
| ---------------------------- | ---------------------------------------------------- |
| `pnpm dev`                   | Run Vite dev server with Cloudflare bindings         |
| `pnpm build`                 | Build the worker + prerender static pages            |
| `pnpm deploy`                | Build and push to Cloudflare                         |
| `pnpm db:migrate:local`      | Apply migrations to local D1                         |
| `pnpm db:migrate:remote`     | Apply migrations to remote D1                        |
| `pnpm db:generate`           | Generate a new drizzle migration from schema changes |
| `pnpm seed:teams:local`      | Insert the 30 NBA teams into local D1                |
| `pnpm seed:teams:remote`     | Insert the 30 NBA teams into remote D1               |
| `pnpm seed:games:local`      | Fetch and insert today's NBA games (local D1)        |
| `pnpm seed:games:remote`     | Fetch and insert today's NBA games (remote D1)       |
| `pnpm check`                 | Type-check                                           |

## Caching

The home route is server-rendered with a long `s-maxage` `Cache-Control`
header so the Cloudflare edge caches the rendered HTML for a day (with
`stale-while-revalidate` of a week). This is the equivalent of the previous
Next.js `cacheLife('days')` setup — the page is rendered once on the worker
and then served as a static asset from the CDN until the cache expires.

If you want to force an immediate refresh after seeding new games, you can
purge the cached URL through the Cloudflare dashboard or API.
