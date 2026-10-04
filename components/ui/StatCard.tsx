import type { ReactNode } from "react";

/**
 * Label + value card used for stat strips. Numeric values render in mono with
 * tabular figures for alignment across a row.
 */
export default function StatCard({
  label,
  value,
  tone,
  hint,
}: {
  label: ReactNode;
  value: ReactNode;
  tone?: "up" | "down" | "accent" | "plain";
  hint?: ReactNode;
}) {
  const toneClass =
    tone === "up"
      ? "text-up"
      : tone === "down"
        ? "text-down"
        : tone === "accent"
          ? "text-accent"
          : "text-foreground";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-surface bg-surface/40 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </div>
      <div
        className={`mt-1.5 truncate font-mono text-xl font-bold tabular-nums ${toneClass}`}
      >
        {value}
      </div>
      {hint != null && (
        <div className="mt-0.5 truncate text-[11px] text-muted-light">{hint}</div>
      )}
    </div>
  );
}