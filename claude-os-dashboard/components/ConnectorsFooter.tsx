import { CheckCircle2, CircleAlert, Circle, Plug } from "lucide-react";
import { getConnectorTiles, ago, type ConnectorTile } from "@/lib/connectors";

function Dot({ status }: { status: ConnectorTile["status"] }) {
  if (status === "connected") return <CheckCircle2 size={11} className="text-emerald-600" />;
  if (status === "error") return <CircleAlert size={11} className="text-red-500" />;
  return <Circle size={11} className="text-muted" />;
}

/**
 * Connectors demoted to a quiet footer strip (Product audit #8): nobody opens
 * a dashboard to confirm Gmail is connected. Reference, not a main widget.
 */
export async function ConnectorsFooter() {
  const tiles = await getConnectorTiles();
  const live = tiles.filter((t) => t.status === "connected").length;

  return (
    <footer className="mt-4 border-t border-border pt-3 flex items-center gap-x-5 gap-y-1.5 flex-wrap text-xs text-muted">
      <span className="flex items-center gap-1.5 font-medium">
        <Plug size={12} /> Connectors <span className="chip">{live} live</span>
      </span>
      {tiles.map((t) => (
        <span key={t.id} className="flex items-center gap-1.5" title={t.summary}>
          <Dot status={t.status} />
          {t.name}
          {t.status !== "disconnected" && <span className="opacity-60">· {ago(t.checkedAt)}</span>}
        </span>
      ))}
    </footer>
  );
}
