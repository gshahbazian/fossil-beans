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

   Then create your local secrets file:

   ```sh
   cp .dev.vars.example .dev.vars
   ```

2. Create a local D1 database and apply migrations:

   ```sh
   pnpm db:migrate:local
   ```

   This uses the binding configured in `wrangler.jsonc` (name `fossil-beans`,
   binding `DB`) and stores data under `.wrangler/`.

3. Seed teams:

   ```sh
   pnpm seed:teams:local
   ```

4. Run the dev server:

   ```sh
   pnpm dev
   ```

   Open http://localhost:3000.

5. Seed today's games through the running Worker:

   ```sh
   pnpm seed:games:local
   # or a specific PST date:
   ./scripts/insert-games.sh --local 2025-01-15
   ```

## Deploying to Cloudflare

This app deploys as a Cloudflare Worker with static assets and a D1 database.
Wrangler creates the Worker on the first deployment.

### One-time setup

1. Authenticate Wrangler and create the production database:

   ```sh
   pnpm exec wrangler login
   pnpm exec wrangler d1 create fossil-beans
   ```

   Copy the returned `database_id` into `d1_databases[0].database_id` in
   `wrangler.jsonc`.

2. Set a random secret for the game-insert and cache-purge endpoints:

   ```sh
   pnpm exec wrangler secret put PURGE_SECRET
   ```

   Keep this value available for remote seed commands. It intentionally does
   not live in `wrangler.jsonc`.

3. Initialize the production database:

   ```sh
   pnpm db:migrate:remote
   pnpm seed:teams:remote
   ```

### Deploy a release

Run checks, apply pending migrations, then deploy:

```sh
pnpm check
pnpm db:migrate:remote
pnpm deploy
```

`pnpm deploy` builds the Worker and client assets, then uploads both with
Wrangler. If PostHog is enabled, provide `VITE_POSTHOG_KEY` in `.env` during the
build; Vite embeds it in the client bundle.

Wrangler prints the deployed Worker URL. Seed games through that Worker so the
home-page cache is purged after the database update:

```sh
PURGE_URL=https://fossil-beans.<your-subdomain>.workers.dev \
PURGE_SECRET=<same-secret-you-put-in-cloudflare> \
pnpm seed:games:remote
```

To seed a specific date:

```sh
PURGE_URL=https://fossil-beans.<your-subdomain>.workers.dev \
PURGE_SECRET=<same-secret-you-put-in-cloudflare> \
./scripts/insert-games.sh --remote 2026-04-12
```

## Scripts

| Script                   | What it does                                         |
| ------------------------ | ---------------------------------------------------- |
| `pnpm dev`               | Run Vite dev server with Cloudflare bindings         |
| `pnpm build`             | Build the Worker and client bundle                   |
| `pnpm deploy`            | Build and push to Cloudflare                         |
| `pnpm db:migrate:local`  | Apply migrations to local D1                         |
| `pnpm db:migrate:remote` | Apply migrations to remote D1                        |
| `pnpm db:generate`       | Generate a new drizzle migration from schema changes |
| `pnpm seed:teams:local`  | Insert the 30 NBA teams into local D1                |
| `pnpm seed:teams:remote` | Insert the 30 NBA teams into remote D1               |
| `pnpm seed:games:local`  | Fetch and insert NBA games for today (local D1)      |
| `pnpm seed:games:remote` | Fetch and insert NBA games for today (remote D1)     |
| `pnpm check`             | Type-check                                           |

## Caching

The home route is server-rendered and cached at the Cloudflare edge by the
native [Workers Cache](https://blog.cloudflare.com/workers-cache/), enabled with
`"cache": { "enabled": true }` in `wrangler.jsonc`. The flow:

1. A request for `/` hits Cloudflare's cache _in front of_ the worker.
2. On a hit, Cloudflare returns the cached HTML **without running the worker**
   (no D1 query, no render).
3. On a miss, the worker runs the TanStack Start handler, which returns the HTML
   with separate browser and edge policies:
   - `Cache-Control: public, max-age=300` caches in the browser for five minutes.
   - `Cloudflare-CDN-Cache-Control: public, max-age=86400, stale-while-revalidate=604800`
     caches at Cloudflare's edge for one day and permits stale responses for one
     week while revalidation happens in the background.

The PostHog proxy, operational API responses, framework errors, and framework
responses without an intentional cache policy send `no-store` policies for both
browsers and Cloudflare. This prevents Workers Cache from assigning heuristic
TTLs to them.

### Invalidation

The `seed:games` script (`scripts/insert-games.sh`) calls
`POST /api/insert-games`, which upserts new game data through Drizzle and then
purges the edge cache so the next request re-renders. The endpoint is
auth-gated by the `PURGE_SECRET` secret.

Purging uses the Workers Cache API — `cache.purge({ purgeEverything: true })`
via `cloudflare:workers`. Because the home page is the only cacheable response,
this invalidates it. The purge is global and needs no origin, so the cron, the
manual endpoint, and local dev all purge the same way.

- Local dev: `PURGE_URL` and `PURGE_SECRET` default to
  `http://localhost:3000` and `local-dev-purge-secret` (the value in
  `.dev.vars.example`). Copy it to `.dev.vars` and run `pnpm dev` before
  `pnpm seed:games:local`. (The local miniflare runtime may not implement
  `cache.purge`; the purge is best-effort and never fails the insert.)
- Production: set the secret with `wrangler secret put PURGE_SECRET` (it is not
  declared in `wrangler.jsonc`, so it is never overwritten on deploy), then run
  the seed script with `PURGE_URL=https://your-host PURGE_SECRET=...`.

You can also manually purge from anywhere:

```sh
curl -X POST -H "Authorization: Bearer $PURGE_SECRET" \
  "$PURGE_URL/api/purge-cache"
```
