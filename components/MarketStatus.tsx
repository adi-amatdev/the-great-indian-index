"use client";

import { useEffect, useState } from "react";
import { getMarketStatus, type MarketStatusInfo } from "@/lib/market";

/** Live market-status hook, refreshed every minute. */
export function useMarketStatus(): MarketStatusInfo {
  const [status, setStatus] = useState<MarketStatusInfo>(() => getMarketStatus());
  useEffect(() => {
    const timer = window.setInterval(() => setStatus(getMarketStatus()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return status;
}

/** Compact status badge: pulsing dot + label. */
export default function MarketStatus({
  className = "",
  dot = true,
}: {
  className?: string;
  dot?: boolean;
}) {
  const status = useMarketStatus();
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider ${
        status.open ? "text-up" : "text-muted"
      } ${className}`}
    >
      {dot && (
        <span
          aria-hidden
          className={`h-2 w-2 rounded-full ${
            status.open
              ? "animate-pulse bg-up"
              : "bg-muted-light"
          }`}
        />
      )}
      {status.label}
    </span>
  );
}