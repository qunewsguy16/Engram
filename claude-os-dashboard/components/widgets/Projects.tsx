import { GitBranch, Hammer, GitPullRequest, Radio, AlertCircle } from "lucide-react";
import { projects as mockProjects } from "@/lib/data/projects";
import { githubSnapshot, todoistData } from "@/lib/connectors";
import type { TodoistProjectItem } from "@/lib/connectors/todoist";

/**
 * Projects source is the user's Todoist project list when the connector is on;
 * otherwise the mock cards with a live GitHub PR overlay. The section title
 * shows which source is active.
 */
export async function Projects() {
  const live = await todoistData();
  if (live && live.projects.length > 0) {
    return <LiveProjects projects={live.projects} />;
  }
  return <MockProjects />;
}

function LiveProjects({ projects }: { projects: TodoistProjectItem[] }) {
  return (
    <section className="card card-pad">
      <div className="flex items-center justify-between">
        <div className="section-title"><Hammer size={12} /> Projects</div>
        <span className="chip inline-flex items-center gap-1">
          <Radio size={10} className="text-emerald-600" /> {projects.length} from Todoist
        </span>
      </div>

      <div className="mt-3 space-y-3">
        {projects.map((p) => (
          <div key={p.id} className="rounded-lg border border-border p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-medium">{p.name}</div>
              <div className="flex items-center gap-2 text-[11px] text-muted flex-none">
                {p.overdueCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-amber-700">
                    <AlertCircle size={11} /> {p.overdueCount} overdue
                  </span>
                )}
                <span className="chip text-[10px]">{p.taskCount} tasks</span>
              </div>
            </div>
            <ul className="mt-2 space-y-1">
              {p.topTasks.map((t, i) => (
                <li key={i} className="text-sm text-ink/80 flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-muted/60 flex-none" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

async function MockProjects() {
  // Live overlay: when the GitHub connector is on, real PR counts replace the
  // mock for the matching repo; otherwise everything falls back to mock.
  const snap = await githubSnapshot();
  const liveRepo = process.env.GITHUB_REPO ?? "qunewsguy16/Engram";

  return (
    <section className="card card-pad">
      <div className="flex items-center justify-between">
        <div className="section-title"><Hammer size={12} /> Projects</div>
        <span className="chip">{mockProjects.length} active</span>
      </div>

      <div className="mt-3 space-y-3">
        {mockProjects.map((p) => {
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
