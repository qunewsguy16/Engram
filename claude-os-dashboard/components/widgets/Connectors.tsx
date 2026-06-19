import { Plug, CheckCircle2, CircleAlert, Circle } from "lucide-react";
import { getConnectorTiles, ago, type ConnectorTile } from "@/lib/connectors";

function StatusDot({ status }: { status: ConnectorTile["status"] }) {
  if (status === "connected") return <CheckCircle2 size={12} className="text-emerald-600" />;
  if (status === "error") return <CircleAlert size={12} className="text-red-500" />;
  return <Circle size={12} className="text-muted" />;
}

export async function Connectors() {
  const tiles = await getConnectorTiles();
  const live = tiles.filter((t) => t.status === "connected").length;

  return (
    <section className="card card-pad">
      <div className="flex items-center justify-between">
        <div className="section-title"><Plug size={12} /> Connectors</div>
        <span className="chip">{live} live</span>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {tiles.map((c) => (
          <div key={c.id} className="rounded-lg border border-border p-3 hover:bg-bg/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusDot status={c.status} />
                <div className="text-sm font-medium">{c.name}</div>
              </div>
              <span className="text-[11px] text-muted">
                {c.status === "disconnected" ? "" : ago(c.checkedAt)}
              </span>
            </div>
            <div className="text-xs text-muted mt-1">{c.summary}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
