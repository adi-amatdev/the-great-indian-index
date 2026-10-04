"use client";

type Option<T extends string> = {
  value: T;
  label: string;
  title?: string;
  disabled?: boolean;
};

export default function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  size = "md",
  className = "",
}: {
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  label?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-xs";
  return (
    <div
      role="tablist"
      aria-label={label}
      className={`inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-xl border border-surface bg-background/70 p-1 no-scrollbar ${className}`}
    >
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            title={option.title}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={`shrink-0 whitespace-nowrap rounded-lg font-bold transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 ${pad} ${
              active
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}