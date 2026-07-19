"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "engram-os:onboarding-dismissed:v1";

/**
 * Thin client wrapper: respects the localStorage dismiss flag (a pure UI
 * preference — fine to keep client-only) and renders the server content with a
 * small dismiss button overlaid in the top-right corner.
 */
export function OnboardingDismiss({ children }: { children: React.ReactNode }) {
  const [dismissed, setDismissed] = useState(true); // hidden until mounted (SSR-safe)

  useEffect(() => {
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (dismissed) return null;

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className="relative">
      {children}
      <button
        onClick={dismiss}
        title="Dismiss"
        className="absolute top-5 right-5 text-muted hover:text-ink"
      >
        <X size={14} />
      </button>
    </div>
  );
}
