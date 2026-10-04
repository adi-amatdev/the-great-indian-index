// NSE market-hours helpers. All times are Asia/Kolkata (UTC+5:30).
// The Indian cash market trades Mon–Fri, 09:15–15:30 IST.

export const IST_OFFSET_MIN = 5 * 60 + 30;

export function istNow(now: Date = new Date()): Date {
  return new Date(now.getTime() + IST_OFFSET_MIN * 60_000);
}

export type MarketStatusInfo = {
  open: boolean;
  status: "open" | "pre-market" | "post-market" | "weekend";
  /** Short, human label e.g. "Market open" / "Market closed". */
  label: string;
};

export function getMarketStatus(now: Date = new Date()): MarketStatusInfo {
  const ist = istNow(now);
  const day = ist.getUTCDay();
  const minutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  const open = 9 * 60 + 15;
  const close = 15 * 60 + 30;
  const weekday = day >= 1 && day <= 5;

  if (weekday && minutes >= open && minutes <= close)
    return { open: true, status: "open", label: "Market open" };
  if (weekday && minutes < open)
    return { open: false, status: "pre-market", label: "Market closed · opens 09:15 IST" };
  if (weekday)
    return { open: false, status: "post-market", label: "Market closed · last close" };
  return { open: false, status: "weekend", label: "Market closed · weekend" };
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