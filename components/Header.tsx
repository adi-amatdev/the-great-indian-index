"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Me = { username: string; cash: number } | null;

export default function Header() {
  const [me, setMe] = useState<Me>(null);
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => !cancelled && setMe(d.user))
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-surface bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
          <span className="text-foreground">
            Bharat Indexes
          </span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {!loaded ? null : me ? (
            <>
              <span className="hidden text-muted sm:inline">
                &#x20B9;{me.cash.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
              <Link
                href="/portfolio"
                className="rounded-full bg-accent px-3 py-1.5 font-semibold text-white transition hover:bg-accent-hover"
              >
                @{me.username}
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-accent px-3 py-1.5 font-semibold text-white transition hover:bg-accent-hover"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
