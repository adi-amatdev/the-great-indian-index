const icons: Record<string, (props: { className?: string }) => React.JSX.Element> = {
  adani: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /><path d="M9 9v.01" /><path d="M9 12v.01" /><path d="M9 15v.01" /><path d="M9 18v.01" />
    </svg>
  ),
  tata: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
    </svg>
  ),
  ev: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  agri: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22V8" /><path d="M5 12H2a10 10 0 0 0 10-10v0a10 10 0 0 0 10 10h-3" /><path d="M8 22h8" /><path d="M7 16c1.5-1 3.5-1 5 0s3.5 1 5 0" />
    </svg>
  ),
  copper: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 10l-2 1-2-1" /><path d="M12 11v4" /><path d="M5 18l3-6h8l3 6" /><path d="M5 18h14" /><path d="M9 18v3h6v-3" />
    </svg>
  ),
  ethanol: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 3h6v6l4 8H5l4-8V3z" /><path d="M9 3h6" /><path d="M8 17h8" />
    </svg>
  ),
  defence: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2l8 4v5c0 5.25-3.5 9.74-8 11-4.5-1.26-8-5.75-8-11V6l8-4z" />
    </svg>
  ),
  railways: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 15V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9" /><path d="M4 15l-1 4h18l-1-4" /><path d="M8 18v2" /><path d="M16 18v2" /><path d="M7 9h.01" /><path d="M17 9h.01" /><path d="M7 13h10" />
    </svg>
  ),
  it: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 4h16v12H4z" /><path d="M8 20h8" /><path d="M12 16v4" /><path d="M8 8l-2 2 2 2" /><path d="M16 8l2 2-2 2" />
    </svg>
  ),
  pharma: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10.5 1.5H8C4.96 1.5 2.5 3.96 2.5 7v10c0 3.04 2.46 5.5 5.5 5.5h8c3.04 0 5.5-2.46 5.5-5.5V7c0-3.04-2.46-5.5-5.5-5.5h-2.5" /><path d="M12 6v12" /><path d="M6 12h12" />
    </svg>
  ),
  banks: ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 21h18" /><path d="M3 10h18" /><path d="M5 6l7-3 7 3" /><path d="M4 10v11" /><path d="M20 10v11" /><path d="M8 14v3" /><path d="M12 14v3" /><path d="M16 14v3" />
    </svg>
  ),
};

export default function IndexIcon({ slug, className = "w-8 h-8" }: { slug: string; className?: string }) {
  const Icon = icons[slug];
  if (!Icon) return null;
  return <Icon className={className} />;
}
