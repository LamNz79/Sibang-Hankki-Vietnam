"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "sibang-hankki:saved-restaurants";
const CHANGE_EVENT = "sibang-hankki:saved-restaurants-change";
const EMPTY_SNAPSHOT = "[]";

export function parseSavedRestaurantSlugs(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((slug): slug is string =>
      typeof slug === "string" && slug.trim().length > 0))];
  } catch {
    return [];
  }
}

export function nextSavedRestaurantSlugs(current: string[], slug: string) {
  return current.includes(slug)
    ? current.filter((value) => value !== slug)
    : [...current, slug];
}

function snapshot() {
  return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY_SNAPSHOT;
}

function serverSnapshot() {
  return EMPTY_SNAPSHOT;
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, listener);
  };
}

export function useSavedRestaurants() {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const slugs = useMemo(() => parseSavedRestaurantSlugs(raw), [raw]);
  const saved = useMemo(() => new Set(slugs), [slugs]);
  const toggle = useCallback((slug: string) => {
    const current = parseSavedRestaurantSlugs(snapshot());
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextSavedRestaurantSlugs(current, slug)),
    );
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return {
    slugs,
    isSaved: (slug: string) => saved.has(slug),
    toggle,
  };
}
