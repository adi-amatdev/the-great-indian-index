import { IndexDef } from "./indices";

// ---- Ranges -----------------------------------------------------------------

export type RangeKey = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "5Y";
export type Weighting = "equal" | "mcap";

export const RANGES: { key: RangeKey; range: string; interval: string }[] = [
  { key: "1D", range: "1d", interval: "5m" },
  { key: "1W", range: "5d", interval: "30m" },
  { key: "1M", range: "1mo", interval: "1d" },
  { key: "3M", range: "3mo", interval: "1d" },
  { key: "6M", range: "6mo", interval: "1d" },
  { key: "1Y", range: "1y", interval: "1d" },
  { key: "5Y", range: "5y", interval: "1wk" },
];

export function resolveRange(key?: string) {
  return RANGES.find((r) => r.key === key) ?? RANGES[0]; // default 1D
}

export function resolveWeighting(w?: string | null): Weighting {
  return w === "mcap" ? "mcap" : "equal";
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---- Types ------------------------------------------------------------------

export type SeriesPoint = { t: number; v: number };

export type ConstituentQuote = {
  symbol: string;
  name: string;
  price: number | null;
  changePct: number | null; // % over the selected range
  marketCap: number | null;
  currency: string;
};

export type IndexData = {
  slug: string;
  name: string;
  weighting: Weighting;
  points: SeriesPoint[]; // index value rebased to 100 at range start
  level: number | null; // latest index level (rebased)
  changePct: number | null; // % over the selected range
  spot: number | null; // range-independent basket unit price in ₹ (for trading)
  constituents: ConstituentQuote[];
  range: RangeKey;
  asOf: number | null; // unix seconds of latest point
  ok: number; // constituents that returned usable data
  total: number;
};

// ---- Crumb + cookie (needed for the quote endpoint / market caps) -----------

let crumbCache: { crumb: string; cookie: string; at: number } | null = null;

async function getCrumb(): Promise<{ crumb: string; cookie: string } | null> {
  if (crumbCache && Date.now() - crumbCache.at < 10 * 60_000) return crumbCache;
  try {
    const res = await fetch("https://fc.yahoo.com", { headers: { "User-Agent": UA } });
    const setCookie = res.headers.get("set-cookie") ?? "";
    const cookie = setCookie.split(";")[0] || "";
    const crumbRes = await fetch(
      "https://query1.finance.yahoo.com/v1/test/getcrumb",
      { headers: { "User-Agent": UA, cookie } },
    );
    const crumb = (await crumbRes.text()).trim();
    if (!crumb || crumb.includes("<")) return null;
    crumbCache = { crumb, cookie, at: Date.now() };
    return crumbCache;
  } catch {
    return null;
  }
}

/** Current price + market cap for a set of symbols (best-effort). */
async function getQuotes(
  symbols: string[],
): Promise<Map<string, { price: number | null; marketCap: number | null }>> {
  const out = new Map<string, { price: number | null; marketCap: number | null }>();
  const c = await getCrumb();
  if (!c) return out;
  try {
    const url =
      `https://query1.finance.yahoo.com/v7/finance/quote` +
      `?symbols=${symbols.map(encodeURIComponent).join(",")}&crumb=${encodeURIComponent(c.crumb)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": UA, cookie: c.cookie },
      next: { revalidate: 300 },
    });
    if (!res.ok) return out;
    const json = await res.json();
    for (const q of json?.quoteResponse?.result ?? []) {
      out.set(q.symbol, {
        price: q.regularMarketPrice ?? null,
        marketCap: q.marketCap ?? null,
      });
    }
  } catch {
    /* best-effort */
  }
  return out;
}

// ---- Raw Yahoo chart fetch --------------------------------------------------

type Chart = {
  timestamps: number[];
  closes: (number | null)[];
  meta: { name: string; currency: string; price: number | null };
};

async function fetchChart(
  symbol: string,
  range: string,
  interval: string,
): Promise<Chart | null> {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?range=${range}&interval=${interval}&includePrePost=false`;
  // Retry a couple of times. Yahoo rate-limits bursts of parallel requests.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA },
        next: { revalidate: 60 },
      });
      if (res.status === 429 || res.status >= 500) {
        await sleep(250 * (attempt + 1));
        continue;
      }
      if (!res.ok) return null;
      const json = await res.json();
      const result = json?.chart?.result?.[0];
      if (!result) return null;
      const timestamps: number[] = result.timestamp ?? [];
      const closes: (number | null)[] =
        result.indicators?.quote?.[0]?.close ?? [];
      const meta = result.meta ?? {};
      if (!timestamps.length || !closes.length) return null;
      return {
        timestamps,
        closes,
        meta: {
          name: meta.shortName ?? meta.longName ?? symbol,
          currency: meta.currency ?? "INR",
          price: meta.regularMarketPrice ?? null,
        },
      };
    } catch {
      await sleep(250 * (attempt + 1));
    }
  }
  return null;
}

// ---- Helpers ----------------------------------------------------------------

function firstValid(arr: (number | null)[]): number | null {
  for (const v of arr) if (v != null && Number.isFinite(v)) return v;
  return null;
}
function lastValid(arr: (number | null)[]): number | null {
  for (let i = arr.length - 1; i >= 0; i--) {
    const v = arr[i];
    if (v != null && Number.isFinite(v)) return v;
  }
  return null;
}

// ---- Index computation ------------------------------------------------------

export async function getIndexData(
  def: IndexDef,
  rangeKey: RangeKey,
  weighting: Weighting = "equal",
): Promise<IndexData> {
  const { range, interval } = resolveRange(rangeKey);

  const [charts, quotes] = await Promise.all([
    Promise.all(
      def.constituents.map((c) => fetchChart(c.symbol, range, interval)),
    ),
    weighting === "mcap"
      ? getQuotes(def.constituents.map((c) => c.symbol))
      : Promise.resolve(
          new Map<string, { price: number | null; marketCap: number | null }>(),
        ),
  ]);

  // Canonical time axis = the longest timestamp array among constituents.
  let axis: number[] = [];
  for (const ch of charts) {
    if (ch && ch.timestamps.length > axis.length) axis = ch.timestamps;
  }

  // Per-constituent rebased ratio series (rebased to 1.0 at its own start),
  // aligned to the canonical axis via forward-fill.
  const ratios: (number | null)[][] = [];
  const weights: number[] = []; // W_i
  const quoteList: ConstituentQuote[] = [];

  charts.forEach((ch, i) => {
    const c = def.constituents[i];
    const q = quotes.get(c.symbol);
    const marketCap = q?.marketCap ?? null;

    if (!ch) {
      quoteList.push({
        symbol: c.symbol,
        name: c.name,
        price: q?.price ?? null,
        changePct: null,
        marketCap,
        currency: "INR",
      });
      ratios.push(axis.map(() => null));
      weights.push(0);
      return;
    }

    const byT = new Map<number, number>();
    ch.timestamps.forEach((t, idx) => {
      const v = ch.closes[idx];
      if (v != null && Number.isFinite(v)) byT.set(t, v);
    });

    const base = firstValid(ch.closes);
    const last = ch.meta.price ?? lastValid(ch.closes);
    quoteList.push({
      symbol: c.symbol,
      name: c.name,
      price: last,
      changePct:
        base != null && last != null ? ((last - base) / base) * 100 : null,
      marketCap,
      currency: ch.meta.currency,
    });

    if (base == null) {
      ratios.push(axis.map(() => null));
      weights.push(0);
      return;
    }

    let lastKnown: number | null = null;
    ratios.push(
      axis.map((t) => {
        const v = byT.get(t);
        if (v != null) lastKnown = v;
        return lastKnown != null ? lastKnown / base : null;
      }),
    );

    // Weight: equal = 1 for anything with data; mcap = market cap (fallback 0).
    weights.push(
      weighting === "mcap" ? (marketCap && marketCap > 0 ? marketCap : 0) : 1,
    );
  });

  // Weighted average of rebased ratios at each timestamp, ×100.
  const points: SeriesPoint[] = [];
  for (let j = 0; j < axis.length; j++) {
    let num = 0;
    let den = 0;
    for (let i = 0; i < ratios.length; i++) {
      const r = ratios[i][j];
      const w = weights[i];
      if (r != null && w > 0) {
        num += w * r;
        den += w;
      }
    }
    if (den > 0) points.push({ t: axis[j], v: (num / den) * 100 });
  }

  const level = points.length ? points[points.length - 1].v : null;
  const first = points.length ? points[0].v : null;
  const changePct =
    level != null && first != null && first !== 0
      ? ((level - first) / first) * 100
      : null;

  // Range-independent basket unit price (₹) for paper trading:
  // weighted average of current constituent prices.
  let sNum = 0;
  let sDen = 0;
  quoteList.forEach((q) => {
    const w = weighting === "mcap" ? (q.marketCap && q.marketCap > 0 ? q.marketCap : 0) : 1;
    if (q.price != null && w > 0) {
      sNum += w * q.price;
      sDen += w;
    }
  });
  const spot = sDen > 0 ? sNum / sDen : null;

  const ok = quoteList.filter((q) => q.price != null).length;

  return {
    slug: def.slug,
    name: def.name,
    weighting,
    points,
    level,
    changePct,
    spot,
    constituents: quoteList,
    range: rangeKey,
    asOf: points.length ? points[points.length - 1].t : null,
    ok,
    total: def.constituents.length,
  };
}

/**
 * Lightweight, range-independent spot price for a whole index, used by the
 * paper-trading server actions so the price is computed server-side, never
 * trusted from the client. Uses the 1D chart for current prices + quotes for
 * market caps (mcap weighting only).
 */
export async function getSpotPrice(
  def: IndexDef,
  weighting: Weighting,
): Promise<number | null> {
  const [charts, quotes] = await Promise.all([
    Promise.all(def.constituents.map((c) => fetchChart(c.symbol, "1d", "1d"))),
    weighting === "mcap"
      ? getQuotes(def.constituents.map((c) => c.symbol))
      : Promise.resolve(
          new Map<string, { price: number | null; marketCap: number | null }>(),
        ),
  ]);

  let num = 0;
  let den = 0;
  charts.forEach((ch, i) => {
    const price = ch?.meta.price ?? (ch ? lastValid(ch.closes) : null);
    const mc = quotes.get(def.constituents[i].symbol)?.marketCap ?? null;
    const w = weighting === "mcap" ? (mc && mc > 0 ? mc : 0) : 1;
    if (price != null && w > 0) {
      num += w * price;
      den += w;
    }
  });
  return den > 0 ? num / den : null;
}
