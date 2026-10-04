// NSE market-hours helpers. All times are Asia/Kolkata (UTC+5:30).
// The Indian cash market trades Mon–Fri, 09:15–15:30 IST.

export const IST_OFFSET_MIN = 5 * 60 + 30;

export function istNow(now: Date = new Date()): Date {
  return new Date(now.getTime() + IST_OFFSET_MIN * 60_000);
}

export type MarketStatusInfo = {
  open: boolean;
  status: "open" | "pre-market" | "post-market" | "weekend" | "holiday";
  /** Short, human label e.g. "Market open" / "Market closed". */
  label: string;
  date: string;
};

function istDateKey(now: Date): string {
  const ist = istNow(now);
  return `${ist.getUTCFullYear()}-${String(ist.getUTCMonth() + 1).padStart(2, "0")}-${String(ist.getUTCDate()).padStart(2, "0")}`;
}

function configuredHolidays(): Set<string> {
  return new Set(
    (process.env.NEXT_PUBLIC_MARKET_HOLIDAYS ?? process.env.MARKET_HOLIDAYS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

export function getMarketStatus(now: Date = new Date()): MarketStatusInfo {
  const ist = istNow(now);
  const day = ist.getUTCDay();
  const minutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  const open = 9 * 60 + 15;
  const close = 15 * 60 + 30;
  const weekday = day >= 1 && day <= 5;
  const date = istDateKey(now);
  const holiday = configuredHolidays().has(date);

  if (holiday)
    return { open: false, status: "holiday", label: "Market closed · holiday", date };

  if (weekday && minutes >= open && minutes <= close)
    return { open: true, status: "open", label: "Market open", date };
  if (weekday && minutes < open)
    return { open: false, status: "pre-market", label: "Market closed · opens 09:15 IST", date };
  if (weekday)
    return { open: false, status: "post-market", label: "Market closed · last close", date };
  return { open: false, status: "weekend", label: "Market closed · weekend", date };
}

export function fmtISTDateTime(t: number | null | undefined): string {
  if (t == null) return "—";
  const d = new Date(t * 1000 + IST_OFFSET_MIN * 60_000);
  return d.toLocaleString("en-IN", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
