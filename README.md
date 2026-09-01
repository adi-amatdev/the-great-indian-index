# Bharat Indexes 🇮🇳

Custom, S&P-500-style index trackers for the Indian market. Each "index" clubs
together the NSE-listed stocks of a theme (Adani, Tata, EV, Agri, Copper,
Ethanol, Defence, Railways, IT, Pharma, Banks) into a **single line** so you can
watch the whole group move together, with a dedicated page per theme.

## Features

- **11 theme indexes**, each a single S&P-style line built from its group's NSE
  stocks, with a dedicated `/index/<slug>` page.
- **Two weighting methods** you can toggle live: **equal weight** and
  **market-cap weight**.
- **Returns calculator** — "if you'd invested ₹X at the start of this range…".
- **Paper trading** — a simple username/password login gives you ₹10,00,000 of
  virtual money to buy/sell index baskets; positions, cash and trade history
  persist in **SQLite**. Positions are tracked separately per weighting method.
- **Portfolio page** — net worth, cash, holdings, per-position P/L and a trade
  log.

## How it works

- **Data source:** [Yahoo Finance](https://finance.yahoo.com) public endpoints
  (`query1.finance.yahoo.com`) — free, no API key, delayed NSE quotes. Chosen
  over Upstox because Upstox requires per-user OAuth app registration + tokens,
  which isn't practical for a public, key-less deployment. Market caps come from
  the `v7/finance/quote` endpoint via Yahoo's cookie+crumb handshake (cached).
- **Index methodology:** each constituent is rebased to 1.0 at the start of the
  selected range, then combined as a **weighted average of the rebased ratios**
  (×100). Weight = 1 for equal weight, or the constituent's market cap for
  market-cap weight. Missing/illiquid points are forward-filled per stock and
  the weights renormalise over whatever is present, so the line stays smooth.
  The UI shows a live `ok/total` constituent count.
- **Tradeable "unit price":** a range-independent basket price = the (equal- or
  market-cap-) weighted average of current constituent prices, in ₹. Paper
  trades buy/sell rupee amounts at this price, always recomputed server-side.
- **Auth:** username + PBKDF2-hashed password (Web Crypto, no external auth
  lib), httpOnly cookie sessions stored in D1.
- **Ranges:** 1D, 1W, 1M, 3M, 6M, 1Y, 5Y (switched client-side, cached).

## Structure

```
lib/indices.ts             Index definitions (themes + constituent tickers)
lib/yahoo.ts               Yahoo fetch + index computation (rebase, both weightings, spot price)
lib/format.ts              Number/percent/price formatting
lib/db.ts                  D1 accessor + row types (via getCloudflareContext)
lib/auth.ts                Register/login/session (PBKDF2 + cookie)
migrations/0001_init.sql   D1 schema (users, sessions, positions, trades)
wrangler.jsonc             Cloudflare bindings (D1 + assets)
open-next.config.ts        OpenNext Cloudflare adapter config
lib/portfolio.ts           Buy/sell + position/trade queries (transactional)
app/actions.ts             Server actions: auth + trading
app/page.tsx               Home grid of all indexes (static, ISR)
app/index/[slug]/page.tsx  Dedicated per-index page (dashboard + constituents)
app/portfolio/page.tsx     Portfolio: holdings, P/L, trade history
app/login/page.tsx         Login / signup
app/api/index/[slug]       JSON endpoint for range + weighting switching
app/api/me                 Lightweight current-user endpoint (for the header)
components/IndexDashboard.tsx  Owns range+weighting; renders chart, calculator, trade panel
components/IndexChart.tsx      Presentational SVG area chart with hover
components/ReturnsCalculator.tsx / TradePanel.tsx / AuthForm.tsx / Header.tsx / Sparkline.tsx
```

Paper-trading data lives in **Cloudflare D1** (SQLite). Locally, miniflare keeps
it under `.wrangler/state` (gitignored); run `npm run db:migrate:local` once to
create the tables.

## Run it locally

```bash
npm install
npm run db:migrate:local   # create the local D1 tables (once)
npm run dev                # http://localhost:3000 (D1 provided by miniflare)
```

## Deploy to Cloudflare (Workers + D1)

This app runs on Cloudflare via the [OpenNext](https://opennext.js.org/cloudflare)
adapter (`@opennextjs/cloudflare`), deployed with **wrangler**. Cloudflare's old
`@cloudflare/next-on-pages` Pages adapter is deprecated in favour of this.

1. **Create the D1 database** and paste its id into `wrangler.jsonc`
   (`d1_databases[0].database_id`):

   ```bash
   npx wrangler login
   npx wrangler d1 create bharat-indexes-db
   ```

2. **Apply migrations** to the remote database:

   ```bash
   npm run db:migrate:remote
   ```

3. **Preview on the real Workers runtime** (optional but recommended):

   ```bash
   npm run preview          # builds with OpenNext + runs wrangler dev
   ```

4. **Deploy:**

   ```bash
   npm run deploy           # opennextjs-cloudflare build && … deploy
   ```

Bindings are declared in `wrangler.jsonc` (D1 `DB`, static `ASSETS`) and typed in
`cloudflare-env.d.ts` (regenerate with `npm run cf-typegen`). `nodejs_compat` is
enabled so the app can use Node-style APIs on Workers.

### What lives where

- **D1 stores only basic state** — users, sessions, positions (units + cost
  basis) and the trade log. **No prices or index values are stored.**
- **All valuation is computed live** from the latest index value fetched from
  Yahoo at request time (current position value, P/L, net worth, the returns
  calculator). A trade just computes the live spot price server-side and records
  units + cost.
- Password hashing uses **Web Crypto PBKDF2** (portable to the Workers runtime —
  no native modules), with httpOnly cookie sessions.

## Add a new index

Append an entry to `INDICES` in `lib/indices.ts` — give it a `slug`, `name`,
`emoji`, `gradient`, `accent` and a list of `{ symbol, name }` constituents
(Yahoo symbols, e.g. `RELIANCE.NS`). The home grid, the `/index/<slug>` page and
the API route pick it up automatically.

## Caching & rendering

Pages use ISR (`revalidate = 60`); all index pages are prerendered via
`generateStaticParams`. Each Yahoo request is server-cached for 60s with a
small retry to smooth over rate-limiting on parallel bursts.

---

Data via Yahoo Finance (NSE, delayed). For information only — **not investment
advice**.
