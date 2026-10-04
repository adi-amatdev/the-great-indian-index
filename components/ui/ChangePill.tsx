import { ArrowDown, ArrowUp } from "./icons";

/**
 * The standard up/down change badge. Positive changes in sage, negative in
 * brick, neutral in muted. Uses tabular numerals so columns stay aligned.
 */
export default function ChangePill({
  value,
  suffix = "%",
  className = "",
  showArrow = true,
}: {
  value: number | null;
  suffix?: string;
  className?: string;
  showArrow?: boolean;
}) {
  if (value == null || !Number.isFinite(value)) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-surface bg-background/60 px-2 py-0.5 text-xs font-bold text-muted ${className}`}
      >
        —
      </span>
    );
  }
  const up = value >= 0;
  const sign = up ? "+" : "";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
        up ? "bg-up-bg text-up" : "bg-down-bg text-down"
      } ${className}`}
    >
      {showArrow &&
        (up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
      {sign}
      {value.toFixed(2)}
      {suffix}
    </span>
  );
}