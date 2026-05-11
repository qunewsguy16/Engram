export const profile = {
  name: "qunewsguy16",
  greetingFocus: "Learn AI/ML deeper, ship side projects, daily focus.",
  goals: [
    { id: "learn-ml", label: "Learn AI/ML deeper", emoji: "" },
    { id: "ship-side", label: "Build & launch side projects", emoji: "" },
    { id: "daily-focus", label: "Daily focus / habits", emoji: "" },
  ],
  habits: [
    { id: "deep-work", label: "Deep work block (90m)", streak: 6 },
    { id: "read-paper", label: "Read 1 paper", streak: 3 },
    { id: "ship-commit", label: "Ship 1 commit", streak: 11 },
    { id: "review-notes", label: "Review notes", streak: 2 },
  ],
};

export type Profile = typeof profile;
