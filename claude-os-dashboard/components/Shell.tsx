import { QuickCapture } from "./QuickCapture";
import { DailyReview } from "./DailyReview";

export function Shell({ children }: { children: React.ReactNode }) {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-ink text-white grid place-items-center text-xs font-mono">
              cc
            </div>
            <div className="leading-tight">
              <div className="text-sm font-medium">Claude Code OS</div>
              <div className="text-xs text-muted">{today}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DailyReview />
            <QuickCapture />
          </div>
        </div>
      </header>
      <main className="max-w-[1400px] mx-auto px-6 py-6">{children}</main>
    </div>
  );
}
