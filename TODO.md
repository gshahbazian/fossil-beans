# TODO

The Next.js/Vercel to TanStack Start/Cloudflare rewrite is substantially complete. The remaining work is deployment setup, validation, and production hardening.

## Required before production deployment

- [ ] Create the remote D1 database:
  ```bash
  pnpm exec wrangler d1 create fossil-beans
  ```
- [ ] Replace `REPLACE_WITH_REMOTE_DB_ID` in `wrangler.jsonc` with the returned D1 database ID.
- [ ] Configure the production cache-purge secret:
  ```bash
  pnpm exec wrangler secret put PURGE_SECRET
  ```
- [ ] Decide whether PostHog should be enabled and, if so, provide `VITE_POSTHOG_KEY` at build time.
- [ ] Regenerate Cloudflare binding types and run the project checks:
  ```bash
  pnpm check
  ```
- [ ] Apply the D1 migrations remotely:
  ```bash
  pnpm db:migrate:remote
  ```
- [ ] Seed teams before inserting games because game records reference teams:
  ```bash
  pnpm seed:teams:remote
  ```
- [ ] Update `compatibility_date` in `wrangler.jsonc` to a current date and review the compatibility changes that become enabled.
- [ ] Fix the production cache headers before relying on stale-while-revalidate. Cloudflare Workers Cache treats `s-maxage` as disabling stale-while-revalidate, so use the appropriate browser and Cloudflare CDN cache headers to express the intended browser TTL, edge TTL, and revalidation behavior.
- [ ] Explicitly mark non-cacheable Worker responses such as `/ingest`, operational API responses, authentication failures, and framework error responses with an appropriate cache policy. With Workers Cache enabled, eligible responses without a `Cache-Control` header may receive heuristic TTLs.
- [ ] Build and deploy the production Worker:
  ```bash
  pnpm deploy
  ```

## Production deployment validation

- [ ] Verify `/` renders correctly through SSR and hydrates without errors.
- [ ] Verify game ordering, player-stat filtering, and stat ordering match the expected behavior.
- [ ] Test player dialogs, tables, tooltips, sticky game headers, and player-click analytics.
- [ ] Test with PostHog both enabled and disabled.
- [ ] Verify static assets, NBA images, and Google Fonts load correctly.
- [ ] Verify D1 reads, writes, migrations, and team foreign-key behavior.
- [ ] Verify authenticated game insertion and cache-purge endpoints reject missing or invalid bearer secrets.
- [ ] Verify the Worker can reach the NBA endpoints without persistent 403 or timeout failures.
- [ ] Verify the `/ingest` PostHog proxy works and strips cookies as intended.
- [ ] Verify the browser and Cloudflare-specific cache headers, stale-while-revalidate behavior, `Cf-Cache-Status`, and global cache-purge behavior on Cloudflare.
- [ ] Verify that `/ingest`, operational API responses, authentication failures, and framework error responses are not cached.
- [ ] Confirm whether `nodejs_compat` is required by the production bundle before considering its removal.

## Application decisions

- [ ] Decide whether operational POST handlers should remain in `src/server-entry.ts` or move to TanStack API/RPC routes. Preserve compatibility with existing non-browser callers.
- [ ] Decide whether scheduled game ingestion should be enabled; `triggers.crons` is currently empty in `wrangler.jsonc`.
- [ ] If cron is enabled, choose its schedule and verify concurrent scheduled/manual writes are safe.
- [ ] Decide whether the current global cache-purge blast radius is acceptable. Workers Cache can cache eligible responses beyond the home page unless they explicitly opt out, so do not assume that `/` is the only entry affected by `purgeEverything`.
- [ ] Compare behavior with `main`, which contains the former Next.js application, if exact parity is required.

## Tests and performance

- [ ] Add automated coverage for server loaders, database filtering/ordering, protected endpoints, and cache headers.
- [ ] Add Zod validation for NBA scoreboard, game-log, and box-score JSON before reading or persisting upstream data, with tests for malformed or changed response shapes.
- [ ] Add an SSR/hydration smoke test for `/`.
- [ ] Add browser tests for dialogs, tables, sticky headers, and analytics behavior.
- [ ] Measure the home loader's one-player-stats-query-per-game fan-out and consolidate queries if needed.
- [ ] Measure the serialized home-page payload as the schedule and stat data grow.
- [ ] Do not add TanStack Query unless a concrete client-side requirement such as polling, live refresh, or mutations is introduced.

## Production readiness

- [ ] Choose and configure the production domain or confirm use of the `workers.dev` domain.
- [ ] Set up CI/CD with build, typecheck, tests, migrations, and controlled deployment.
- [ ] Confirm that local development uses local D1 and `.dev.vars`, while the top-level Wrangler configuration and remote D1 binding are production-only. No staging deployment or staging Cloudflare environment is planned.
- [ ] Define secret rotation and recovery procedures for `PURGE_SECRET`.
- [ ] Add production monitoring, alerting, and an external log/error sink beyond console logging.
- [ ] Confirm Cloudflare plan capabilities for D1, cron, observability, and cache purge.
- [ ] Document rollback procedures for Worker deployments and D1 migrations.
- [ ] Inventory and retire any remaining Vercel dashboard resources, domains, environment variables, cron jobs, or integrations after cutover.

## Optional cleanup

- [ ] Remove stale generated environment declarations after regenerating `worker-configuration.d.ts`.
- [ ] Evaluate the remaining `'use client'` directives and remove them only after build and hydration validation.
- [ ] Ensure `src/routeTree.gen.ts` is always generated by tooling and never edited manually.
