import { useEffect } from "react";

const CACHE_PREFIX = "prc_offline_";

export function cacheData<T>(key: string, data: T) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // storage full — silently fail
  }
}

export function getCachedData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw).data as T;
  } catch {
    return null;
  }
}

/** Hook that caches data whenever it changes */
export function useOfflineCache<T>(key: string, data: T, isLoaded: boolean) {
  useEffect(() => {
    if (isLoaded && data) {
      cacheData(key, data);
    }
  }, [key, data, isLoaded]);
}
