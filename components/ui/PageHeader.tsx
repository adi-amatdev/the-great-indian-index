import type { ReactNode } from "react";

/**
 * Consistent page heading across the app: mono eyebrow, display title,
 * description and an optional right-aligned action block.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  aside,
  className = "",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-5 ${className}`}
    >
      <div className="max-w-2xl">
        {eyebrow != null && (
          <p className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.22em] text-accent">
            <span aria-hidden className="inline-block h-px w-6 bg-accent/50" />
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {description != null && (
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            {description}
          </p>
        )}
      </div>
      {aside != null && <div className="shrink-0">{aside}</div>}
    </header>
  );
}