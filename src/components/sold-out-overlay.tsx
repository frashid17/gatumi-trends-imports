/** Diagonal ribbon on product imagery — pointer-events-none so parent links stay clickable. */
export function SoldOutOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-[inherit]"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[var(--background)]/35" />
      <span className="relative w-[150%] max-w-none -rotate-[32deg] border-y-2 border-[var(--gold)]/70 bg-[var(--foreground)]/92 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--background)] shadow-lg sm:py-3.5 sm:text-sm">
        Sold out
      </span>
    </div>
  );
}
