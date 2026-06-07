This repo deploys as a **Cloudflare Worker with static assets**, not as a Pages project. You do not need to create the Worker manually in the console; `wrangler deploy` will create/update it from `wrangler.jsonc`.

**One-Time Setup**

1. Create/log into a Cloudflare account.

2. Authenticate Wrangler locally:

```bash
pnpm exec wrangler login
```

Cloudflare docs: Wrangler login opens an OAuth browser flow. Source: https://developers.cloudflare.com/workers/wrangler/commands/general/#login

3. Create the remote D1 database:

```bash
pnpm exec wrangler d1 create fossil-beans
```

That prints a `database_id`. Put that value into `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "fossil-beans",
    "database_id": "PASTE_REAL_DATABASE_ID_HERE",
    "migrations_dir": "./drizzle"
  }
]
```

Cloudflare docs: `d1 create` creates a remote D1 DB and returns the binding/UUID for config. Source: https://developers.cloudflare.com/d1/wrangler-commands/#d1-create

4. Set the production purge secret:

```bash
pnpm exec wrangler secret put PURGE_SECRET
```

Use a random value. Save it somewhere because your remote seed script needs it to purge the cached home page after new data lands.

Cloudflare docs: secrets are added with `wrangler secret put`. Source: https://developers.cloudflare.com/workers/configuration/secrets/

5. Regenerate/check types:

```bash
pnpm check
```

**Prepare Remote DB**

Run migrations against the Cloudflare-hosted D1 database:

```bash
pnpm db:migrate:remote
```

Seed teams:

```bash
pnpm seed:teams:remote
```

Seed games. For real production use:

```bash
pnpm seed:games:remote
```

If there are no games today and you just want test data in production:

```bash
./scripts/insert-todays-games.sh --remote 2026-04-12 --debug
```

Cloudflare docs: `d1 migrations apply` applies unapplied migrations; `--remote` targets the remote DB. Source: https://developers.cloudflare.com/d1/wrangler-commands/#d1-migrations-apply

**Deploy**

```bash
pnpm deploy
```

That runs:

```bash
vite build && wrangler deploy
```

Wrangler will create/update the Worker named `fossil-beans`. Your `assets.directory` is `./dist/client`, so static client files are uploaded with the Worker. Cloudflare docs: Workers static assets use the `assets.directory` config, and `wrangler deploy` deploys the Worker. Sources:
https://developers.cloudflare.com/workers/static-assets/binding/
https://developers.cloudflare.com/workers/wrangler/commands/workers/#deploy

After deploy, Wrangler should print a URL like:

```text
https://fossil-beans.<your-subdomain>.workers.dev
```

If you seeded after deploy, purge the production cache:

```bash
PURGE_URL=https://fossil-beans.<your-subdomain>.workers.dev \
PURGE_SECRET=<same-secret-you-put-in-cloudflare> \
pnpm seed:games:remote
```

**Optional Later**

- Add a custom domain in Cloudflare dashboard under the deployed Worker’s Domains/Routes settings.
- Set up GitHub Actions or Cloudflare Builds later once manual deploy works.
- If you want PostHog, set `VITE_POSTHOG_KEY` in your local `.env` before `pnpm deploy`, because that value is baked in at Vite build time.
