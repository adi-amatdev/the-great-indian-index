# Bharat Indexes 

Custom, S&P-500-style index trackers for the Indian market. Each "index" clubs
together the NSE-listed stocks of a theme (Adani, Tata, EV, Agri, Copper,
Ethanol, Defence, Railways, IT, Pharma, Banks) into a **single line** so you can
watch the whole group move together, with a dedicated page per theme.

## Features

- **11 theme indexes**, each a single S&P-style line built from its group's NSE
  stocks, with a dedicated `/index/<slug>` page.
- **Two weighting methods** you can toggle live: **equal weight** and
  **market-cap weight**.
- **Returns calculator** - "if you'd invested ₹X at the start of this range…".
- **Paper trading** - a simple username/password login gives you ₹10,00,000 of
  virtual money to buy/sell index baskets; positions, cash and trade history
  persist in **PostgreSQL (Neon)**. Positions are tracked separately per
  weighting method.
- **Portfolio page** - net worth, cash, holdings, per-position P/L and a trade
  log.

## How it works

- **Data source:** [Yahoo Finance](https://finance.yahoo.com) public endpoints
  (`query1.finance.yahoo.com`) - free, no API key, delayed NSE quotes. Chosen
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
  lib), httpOnly cookie sessions stored in Postgres.
- **Ranges:** 1D, 1W, 1M, 3M, 6M, 1Y, 5Y (switched client-side, cached).

## Structure

```
lib/indices.ts             Index definitions (themes + constituent tickers)
lib/yahoo.ts               Yahoo fetch + index computation (rebase, both weightings, spot price)
lib/format.ts              Number/percent/price formatting
lib/prisma.ts              Singleton PrismaClient (Postgres/Neon)
lib/db.ts                  STARTING_CASH constant
lib/auth.ts                Register/login/session (PBKDF2 + cookie, Prisma)
lib/portfolio.ts           Buy/sell + position/trade queries (Prisma interactive tx)
prisma/schema.prisma       Prisma schema (users, sessions, positions, trades)
prisma/migrations/         Prisma migration history (applied to Neon)
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
scripts/db-migrate.mjs     Runs `prisma migrate deploy` (loads .env.local if present)
```

Paper-trading data lives in **PostgreSQL on Neon**. Set `DATABASE_URL` in
`.env.local` (see `.env.example`) and run `npm run db:migrate` once to create
the tables.

## Run it locally

```bash
cp .env.example .env.local   # then set DATABASE_URL to your Neon connection string
npm install
npm run db:migrate           # create/update the Postgres tables
npm run dev                  # http://localhost:3000
```

## Deploy to Vercel + Neon

This is a standard Next.js (App Router) app. It deploys through **Vercel's Git
integration** - no Cloudflare/wrangler is involved.

1. **Create a Neon project** and copy its pooled connection string
   (`postgres://…neon.tech/…?sslmode=require`).
2. **Import the repo into Vercel** (dashboard → Add New → Project). Vercel will
   run `npm run build` automatically on every push to `main`.
3. **Add the `DATABASE_URL` env var** in Vercel (Project → Settings → Environment
   Variables) for Production, Preview and Development.
4. **Apply migrations** once (locally or via the included GitHub Action, which
   runs `npm run db:migrate` with `DATABASE_URL` as a repo secret on push).

### What lives where

- **Postgres stores only basic state** - users, sessions, positions (units +
  cost basis) and the trade log. **No prices or index values are stored.**
- **All valuation is computed live** from the latest index value fetched from
  Yahoo at request time (current position value, P/L, net worth, the returns
  calculator). A trade just computes the live spot price server-side and records
  units + cost.
- Password hashing uses **Web Crypto PBKDF2**, with httpOnly cookie sessions.

## Add a new index

Append an entry to `INDICES` in `lib/indices.ts` - give it a `slug`, `name`,
`gradient`, `accent` and a list of `{ symbol, name }` constituents
(Yahoo symbols, e.g. `RELIANCE.NS`). The home grid, the `/index/<slug>` page and
the API route pick it up automatically.

## Caching & rendering

Pages use ISR (`revalidate = 60`); all index pages are prerendered via
`generateStaticParams`. Each Yahoo request is server-cached for 60s with a
small retry to smooth over rate-limiting on parallel bursts.

---

Data via Yahoo Finance (NSE, delayed). For information only - **not investment
advice**.
