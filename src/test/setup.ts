import { beforeEach, vi } from "vitest";

const store: Record<string, unknown> = {};

beforeEach(() => {
  for (const key of Object.keys(store)) {
    delete store[key];
  }

  globalThis.chrome = {
    storage: {
      local: {
        get: vi.fn(async (keys?: string | string[] | Record<string, unknown>) => {
          if (!keys) return { ...store };

          if (typeof keys === "string") {
            return keys in store ? { [keys]: store[keys] } : {};
          }

          if (Array.isArray(keys)) {
            return keys.reduce<Record<string, unknown>>((acc, key) => {
              if (key in store) acc[key] = store[key];
              return acc;
            }, {});
          }

          return Object.keys(keys).reduce<Record<string, unknown>>((acc, key) => {
            acc[key] = key in store ? store[key] : keys[key];
            return acc;
          }, {});
        }),
        set: vi.fn(async (items: Record<string, unknown>) => {
          Object.assign(store, items);
        }),
        remove: vi.fn(async (keys: string | string[]) => {
          for (const key of Array.isArray(keys) ? keys : [keys]) {
            delete store[key];
          }
        }),
      },
    },
  } as unknown as typeof chrome;
});
