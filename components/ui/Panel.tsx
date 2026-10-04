import type { ReactNode } from "react";

/**
 * The app's standard "research desk" panel: a ruled card with a ticker-tape
 * header strip (mono label left, mono context right) and body content.
 * Every data block on the site shares this framing so the pages feel like one
 * instrument, not a pile of boxes.
 */
export default function Panel({
  label,
  context,
  children,
  className = "",
  bodyClassName = "p-4 sm:p-5",
}: {
  label?: ReactNode;
  context?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-surface bg-surface/40 shadow-sm shadow-black/[0.03] ${className}`}
    >
      {(label != null || context != null) && (
        <div className="flex items-center justify-between gap-3 border-b border-surface bg-background/50 px-4 py-2.5">
          <div className="min-w-0 truncate font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
            {label}
          </div>
          {context != null && (
            <div className="min-w-0 shrink-0 truncate font-mono text-[11px] tabular-nums text-muted-light">
              {context}
            </div>
          )}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}