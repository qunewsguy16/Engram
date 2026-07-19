/**
 * CJS preload: stub out modules that guard against non-Next.js environments.
 * Loaded via: tsx --require ./scripts/_stubs.cjs
 *
 * Patches Module._resolveFilename to redirect:
 *   - "server-only"  → an empty CJS module (the guard just throws; irrelevant outside Next)
 *   - "next/cache"   → a CJS module exporting no-op helpers
 *
 * Also registers real CJS module objects for those specifiers so require() returns
 * the stub directly without hitting the filesystem.
 */
"use strict";

const Module = require("node:module");
const path = require("node:path");

// Build stub Module objects
function makeStub(exports) {
  const m = new Module("<stub>");
  m.exports = exports;
  m.loaded = true;
  return m;
}

const SERVER_ONLY_STUB = makeStub({});
const NEXT_CACHE_STUB = makeStub({
  revalidatePath: function () {},
  revalidateTag: function () {},
  unstable_cache: function (fn) { return fn; },
});

// Map bare specifier → stub Module
const STUBS = new Map([
  ["server-only", SERVER_ONLY_STUB],
  ["next/cache", NEXT_CACHE_STUB],
]);

// Patch require() cache with sentinel paths so require() returns our stubs
const SENTINEL = {
  "server-only": path.resolve(__dirname, "__stub__server-only__.js"),
  "next/cache": path.resolve(__dirname, "__stub__next-cache__.js"),
};

for (const [spec, sentinel] of Object.entries(SENTINEL)) {
  const stub = STUBS.get(spec);
  if (stub) {
    stub.filename = sentinel;
    stub.id = sentinel;
    require.cache[sentinel] = stub;
  }
}

// Patch _resolveFilename to return the sentinel path for stub specifiers
const _orig = Module._resolveFilename.bind(Module);
Module._resolveFilename = function (request, parent, isMain, options) {
  if (STUBS.has(request)) {
    return SENTINEL[request];
  }
  return _orig(request, parent, isMain, options);
};
