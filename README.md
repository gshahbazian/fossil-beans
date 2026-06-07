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
   ./scripts/insert-games.sh --local 2025-01-15
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
| `pnpm seed:games:local`      | Fetch and insert NBA games for today (local D1)      |
| `pnpm seed:games:remote`     | Fetch and insert NBA games for today (remote D1)     |
| `pnpm check`                 | Type-check                                           |

## Caching

The home route is server-rendered and then cached at the Cloudflare edge
using the Worker [Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/).
The flow:

1. A request for `/` hits the worker (`src/server-entry.ts`).
2. The worker checks `caches.default` for the URL. On hit (`x-fb-cache:
   HIT`), it returns the cached HTML without touching D1.
3. On miss, it runs the TanStack Start handler (which queries D1, renders),
   stores the response in `caches.default` honoring the route's
   `Cache-Control: s-maxage=86400` header, and returns it.

This is the equivalent of the old Next.js `cacheLife('days')` setup.

### Invalidation

The `seed:games` script (`scripts/insert-games.sh`) calls
`POST /api/purge-cache` after upserting new game data so the next request
re-renders. The endpoint is auth-gated by the `PURGE_SECRET` worker var.

- Local dev: `PURGE_URL` and `PURGE_SECRET` default to
  `http://localhost:3000` and `local-dev-purge-secret` (the value in
  `wrangler.jsonc`). No setup needed.
- Production: set the real secret with `wrangler secret put PURGE_SECRET`
  (this shadows the dev default declared in `wrangler.jsonc`), then run
  the seed script with `PURGE_URL=https://your-host PURGE_SECRET=...`.

You can also manually purge from anywhere:

```sh
curl -X POST -H "Authorization: Bearer $PURGE_SECRET" \
  "$PURGE_URL/api/purge-cache"
```
