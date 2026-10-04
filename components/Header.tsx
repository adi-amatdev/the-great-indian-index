"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TrendMark } from "./ui/icons";

type Me = { username: string; cash: number } | null;

const NAV = [
  { href: "/compare", label: "Compare" },
  { href: "/leaderboard", label: "Leaders" },
  { href: "/custom", label: "My indexes" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/inbox", label: "Inbox" },
];

function inr(v: number) {
  return `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

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
    <header className="sticky top-0 z-20">
      {/* Liquid translucent backdrop: content blurs as it scrolls under the bar. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 border-b border-surface bg-gradient-to-b from-background/90 via-background/70 to-background/45 backdrop-blur-xl"
      />
      {/* Illumination glow that echoes the home page's warm tint. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-12 -z-10 h-24 bg-[radial-gradient(50rem_6rem_at_72%_0%,rgba(125,64,71,0.10),transparent_62%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-12 -z-10 h-20 bg-[radial-gradient(34rem_5rem_at_18%_0%,rgba(88,129,87,0.08),transparent_60%)]"
      />
      <div className="relative mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 sm:px-5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white shadow-sm shadow-accent/30">
            <TrendMark className="h-4 w-4" />
          </span>
          <span className="whitespace-nowrap font-black tracking-tight text-foreground">
            Bharat Indexes
          </span>
        </Link>

        {loaded && (
          <nav
            aria-label="Primary"
            className="no-scrollbar -mx-1 flex flex-1 items-center gap-0.5 overflow-x-auto px-1 text-sm"
          >
            {NAV.filter(
              (item) => item.href !== "/custom" || Boolean(me),
            ).map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 transition ${
                    active
                      ? "bg-surface font-bold text-foreground"
                      : "text-muted hover:bg-surface/60 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-2">
          {!loaded ? null : me ? (
            <>
              <span
                title="Available cash"
                className="hidden rounded-full border border-surface bg-background px-3 py-1.5 font-mono text-xs font-semibold tabular-nums text-muted sm:inline-flex"
              >
                {inr(me.cash)}
              </span>
              <Link
                href={`/user/${me.username}`}
                className="rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
              >
                @{me.username}
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
