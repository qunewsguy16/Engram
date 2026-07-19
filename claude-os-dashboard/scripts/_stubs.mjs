/**
 * ESM loader preload: stubs out modules that are valid server-side in Next.js
 * but throw (or import Next.js internals) when executed in a plain Node process.
 *
 * Loaded via: node --import ./scripts/_stubs.mjs
 *
 * Uses Node 22's module.register() + a custom resolve/load hook to intercept:
 *   - "server-only"  → empty module (the guard is irrelevant outside Next)
 *   - "next/cache"   → exports { revalidatePath: () => {} } no-op
 */
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register(
  // Inline the hooks as a data: URL so we don't need a separate loader file.
  `data:text/javascript,
import { pathToFileURL } from "node:url";

const STUBS = {
  "server-only": \`export default {};\`,
  "next/cache":  \`export function revalidatePath() {} export function revalidateTag() {} export function unstable_cache(fn) { return fn; }\`,
};

export async function resolve(specifier, context, nextResolve) {
  if (STUBS[specifier]) {
    return { shortCircuit: true, url: "data:text/javascript," + encodeURIComponent(STUBS[specifier]) };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.startsWith("data:text/javascript,")) {
    const code = decodeURIComponent(url.slice("data:text/javascript,".length));
    return { shortCircuit: true, format: "module", source: code };
  }
  return nextLoad(url, context);
}
`,
  pathToFileURL("./")
);
