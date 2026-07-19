import type { Connector, ConnectorMeta, Health, Result } from "./types";
import { ok, fail } from "./types";

/**
 * Shared connector lifecycle. The gated-enable / injectable-fetch /
 * list->Result / health-never-throws / disabled-vs-error branching is the
 * get-it-right-once infrastructure; the only per-API variation is the snapshot
 * fetch + the success detail string. Connectors with the standard
 * {enabled, token, fetchImpl} deps are defined via this builder so the lifecycle
 * lives in one place. (GitHub keeps its own factory: it has an extra `repo`
 * dep, a dual fetch, and a typed snapshot consumer.)
 */

export interface ConnectorDeps {
  enabled?: boolean;
  token?: string;
  fetchImpl?: typeof fetch;
}

export interface ConnectorDef<S> {
  meta: ConnectorMeta;
  errorCode: string;
  disabledDetail: string;
  fetchSnapshot(token: string, f: typeof fetch): Promise<S>;
  detail(snapshot: S): string;
}

export function defineConnector<S>(def: ConnectorDef<S>) {
  return (deps: ConnectorDeps = {}): Connector<S> => {
    const enabled = deps.enabled ?? false;
    const f = deps.fetchImpl ?? fetch;
    const live = () => enabled && !!deps.token;
    return {
      meta: def.meta,
      async list(): Promise<Result<S[]>> {
        if (!live()) return fail("disabled", `${def.meta.name} live reads are off`, []);
        try {
          return ok([await def.fetchSnapshot(deps.token!, f)], "live");
        } catch (e) {
          return fail(def.errorCode, (e as Error).message, []);
        }
      },
      async health(): Promise<Health> {
        if (!live()) return { status: "disconnected", checkedAt: Date.now(), detail: def.disabledDetail };
        try {
          const s = await def.fetchSnapshot(deps.token!, f);
          return { status: "connected", checkedAt: Date.now(), detail: def.detail(s) };
        } catch (e) {
          return { status: "error", checkedAt: Date.now(), detail: (e as Error).message };
        }
      },
    };
  };
}
