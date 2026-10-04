export default function Loading() {
  return (
    <main className="mx-auto flex min-h-[40vh] w-full max-w-6xl items-center justify-center px-5">
      <div className="flex items-center gap-3 rounded-full border border-surface bg-surface/50 px-4 py-2.5 font-mono text-xs font-semibold text-muted">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        Loading workspace…
      </div>
    </main>
  );
}
