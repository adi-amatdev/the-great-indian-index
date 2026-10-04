"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const resetTimer = window.setTimeout(() => setActive(false), 0);
    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest("a");
      if (!target || target.target === "_blank" || target.hasAttribute("download")) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href === pathname) return;
      setActive(true);
    };
    document.addEventListener("click", onClick);
    return () => {
      window.clearTimeout(resetTimer);
      document.removeEventListener("click", onClick);
    };
  }, [pathname]);

  return <div aria-hidden className={`fixed left-0 right-0 top-0 z-50 h-0.5 origin-left bg-accent shadow-[0_0_12px_rgba(125,64,71,0.75)] transition-transform duration-300 ${active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`} />;
}
