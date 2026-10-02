// src/lib/api/dev-fallback.ts
export async function withDevFallback<T>(
  request: () => Promise<T>,
  fallback: () => T,
): Promise<T> {
  try {
    return await request();
  } catch (error) {
    // Only network errors use the development prototype fallback.
    if (process.env.NODE_ENV !== "development" || !(error instanceof TypeError)) {
      throw error;
    }
    console.warn("API unavailable; using prototype data.");
    return fallback();
  }
}
