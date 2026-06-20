import { describe, it, expect, beforeEach } from "vitest";
import { installLocalStorageShim, resetLocalStorage } from "../test/stubs/localstorage";

installLocalStorageShim();

import { createLocalStore, uid, ago } from "./localStore";

beforeEach(() => resetLocalStorage());

describe("createLocalStore", () => {
  it("all() returns [] initially", () => {
    const store = createLocalStore<number>("k");
    expect(store.all()).toEqual([]);
  });

  it("set() then all() round-trips the array", () => {
    const store = createLocalStore<{ id: number }>("k");
    const items = [{ id: 1 }, { id: 2 }];
    store.set(items);
    expect(store.all()).toEqual(items);
  });

  it("two stores with different keys are independent", () => {
    const a = createLocalStore<number>("a");
    const b = createLocalStore<number>("b");
    a.set([1, 2]);
    b.set([3]);
    expect(a.all()).toEqual([1, 2]);
    expect(b.all()).toEqual([3]);
  });

  it("subscribe() fires when set() is called on the SAME key", () => {
    const store = createLocalStore<number>("k");
    let calls = 0;
    store.subscribe(() => {
      calls++;
    });
    store.set([1]);
    expect(calls).toBe(1);
  });

  it("subscribe() does NOT fire for a different key's store", () => {
    const watched = createLocalStore<number>("watched");
    const other = createLocalStore<number>("other");
    let calls = 0;
    watched.subscribe(() => {
      calls++;
    });
    other.set([1]);
    expect(calls).toBe(0);
  });

  it("the unsubscribe function stops further callbacks", () => {
    const store = createLocalStore<number>("k");
    let calls = 0;
    const unsubscribe = store.subscribe(() => {
      calls++;
    });
    store.set([1]);
    expect(calls).toBe(1);
    unsubscribe();
    store.set([2]);
    expect(calls).toBe(1);
  });

  it("all() tolerates malformed JSON", () => {
    const store = createLocalStore<number>("k");
    window.localStorage.setItem("k", "not json");
    expect(store.all()).toEqual([]);
  });
});

describe("uid", () => {
  it("returns unique-ish strings (two calls differ)", () => {
    expect(uid()).not.toBe(uid());
  });
});

describe("ago", () => {
  it("formats 'just now' for <60s", () => {
    expect(ago(Date.now() - 5_000)).toBe("just now");
  });

  it("formats minutes", () => {
    expect(ago(Date.now() - 5 * 60_000)).toBe("5m");
  });

  it("formats hours", () => {
    expect(ago(Date.now() - 3 * 60 * 60_000)).toBe("3h");
  });

  it("formats days", () => {
    expect(ago(Date.now() - 2 * 24 * 60 * 60_000)).toBe("2d");
  });
});
