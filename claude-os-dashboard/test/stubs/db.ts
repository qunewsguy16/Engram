import { beforeEach, afterEach } from "vitest";
import { _setDbForTesting, _clearDbForTesting, openMemoryDb } from "@/lib/db";

/**
 * Install a fresh in-memory SQLite DB for each test in the calling file.
 * Drop-in replacement for the old localStorage shim — call once at the top
 * of a test module instead of installLocalStorageShim().
 */
export function useTestDb(): void {
  beforeEach(() => _setDbForTesting(openMemoryDb()));
  afterEach(() => _clearDbForTesting());
}
