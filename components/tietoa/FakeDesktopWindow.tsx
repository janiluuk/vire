const STYLES = {
  productivity: "from-emerald-900/80 via-g/25 to-canvas",
  gaming: "from-violet-950/90 via-fuchsia-900/40 to-canvas",
  creative: "from-amber-900/70 via-orange-900/30 to-canvas",
  daily: "from-sky-900/75 via-cyan-900/35 to-canvas",
} as const;

export type FakeDesktopVariant = keyof typeof STYLES;

export function FakeDesktopWindow({
  variant,
  chrome,
  className = "",
}: {
  variant: FakeDesktopVariant;
  chrome: string;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-edge bg-gradient-to-br shadow-lg ${STYLES[variant]} ${className}`}
    >
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/25 px-3 py-2">
        <span className="size-2.5 rounded-full bg-red-400/80" aria-hidden />
        <span className="size-2.5 rounded-full bg-amber-400/80" aria-hidden />
        <span className="size-2.5 rounded-full bg-g/80" aria-hidden />
        <span className="ml-2 truncate font-mono text-[10px] text-fog/90">
          {chrome}
        </span>
      </div>
      <div className="flex h-[calc(100%-2.5rem)] flex-col gap-2 p-3">
        <div className="h-2 w-3/4 rounded bg-white/10" aria-hidden />
        <div className="h-2 w-1/2 rounded bg-white/10" aria-hidden />
        <div className="mt-auto grid grid-cols-3 gap-2">
          <div
            className="h-10 rounded border border-white/10 bg-white/5"
            aria-hidden
          />
          <div
            className="h-10 rounded border border-white/10 bg-white/5"
            aria-hidden
          />
          <div
            className="h-10 rounded border border-white/10 bg-white/5"
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
