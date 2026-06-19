import { GitBranch, Hammer, GitPullRequest, Radio } from "lucide-react";
import { projects } from "@/lib/data/projects";
import { githubSnapshot } from "@/lib/connectors";

export async function Projects() {
  // Live overlay: when the GitHub connector is on, real PR counts replace the
  // mock for the matching repo; otherwise everything falls back to mock.
  const snap = await githubSnapshot();
  const liveRepo = process.env.GITHUB_REPO ?? "qunewsguy16/Engram";

  return (
    <section className="card card-pad">
      <div className="flex items-center justify-between">
        <div className="section-title"><Hammer size={12} /> Projects</div>
        <span className="chip">{projects.length} active</span>
      </div>

      <div className="mt-3 space-y-3">
        {projects.map((p) => {
          const isLive = snap !== null && p.repo === liveRepo;
          const openPRs = isLive ? snap!.openPRs : p.openPRs;
          return (
            <div key={p.id} className="rounded-lg border border-border p-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium flex items-center gap-1.5">
                    {p.name}
                    {isLive && <Radio size={11} className="text-emerald-600" aria-label="live" />}
                  </div>
                  <div className="text-xs text-muted">{p.description}</div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted">
                  {p.branch && (
                    <span className="font-mono inline-flex items-center gap-1">
                      <GitBranch size={11} /> {p.branch.length > 22 ? p.branch.slice(0, 22) + "..." : p.branch}
                    </span>
                  )}
                  {openPRs > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <GitPullRequest size={11} /> {openPRs}
                    </span>
                  )}
                </div>
              </div>
              <ul className="mt-2 space-y-1">
                {p.todos.slice(0, 3).map((t, i) => (
                  <li key={i} className="text-sm text-ink/80 flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-muted/60 flex-none" />
                    {t}
                  </li>
                ))}
              </ul>
              {p.nextMilestone && (
                <div className="text-[11px] text-accent mt-2">Next: {p.nextMilestone}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
