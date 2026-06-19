"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { capture } from "@/lib/inbox";

/**
 * Global quick-capture modal. ⌘⇧N (or Ctrl+Shift+N) opens; Esc cancels;
 * ⌘↵ or plain ↵ submits. Friction is the make-or-break for daily use —
 * keep the path keystroke-only.
 */
export function QuickCapture() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.shiftKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => ref.current?.focus());
    else setText("");
  }, [open]);

  function submit() {
    if (capture(text)) setOpen(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn" title="Quick capture (⌘⇧N)">
        <Sparkles size={14} /> Capture <span className="kbd">⌘⇧N</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-ink/20 backdrop-blur-sm grid place-items-start pt-[18vh] px-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Quick capture"
            className="card w-full max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <textarea
              ref={ref}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Capture a thought.  #tags supported.  ⌘↵ to save, Esc to cancel."
              className="w-full p-4 text-base bg-transparent outline-none resize-none min-h-[120px]"
            />
            <div className="flex items-center justify-between px-4 py-2 border-t border-border text-xs text-muted">
              <span>Lands in your inbox · #tag inferred</span>
              <button onClick={submit} className="btn-primary" disabled={!text.trim()}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
