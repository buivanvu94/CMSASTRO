type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

type CacheStore = Map<string, CacheEntry<unknown>>;
type PendingStore = Map<string, Promise<unknown>>;

const globalWithPerfCache = globalThis as typeof globalThis & {
  __CMSASTRO_CACHE__?: CacheStore;
  __CMSASTRO_PENDING__?: PendingStore;
};

const cacheStore: CacheStore = globalWithPerfCache.__CMSASTRO_CACHE__ ?? new Map();
const pendingStore: PendingStore = globalWithPerfCache.__CMSASTRO_PENDING__ ?? new Map();

globalWithPerfCache.__CMSASTRO_CACHE__ = cacheStore;
globalWithPerfCache.__CMSASTRO_PENDING__ = pendingStore;

export const getOrSetCache = async <T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
): Promise<T> => {
  const now = Date.now();
  const cached = cacheStore.get(key) as CacheEntry<T> | undefined;
  if (cached && cached.expiresAt > now) return cached.value;

  const pending = pendingStore.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const next = (async () => {
    const value = await loader();
    cacheStore.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  })();

  pendingStore.set(key, next);
  try {
    return await next;
  } finally {
    pendingStore.delete(key);
  }
};

export const fetchJsonWithTimeout = async <T>(
  url: string,
  init: RequestInit = {},
  timeoutMs = 3500
): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal
    });
    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }
    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
};
