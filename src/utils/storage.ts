// localStorage can throw (private mode, blocked site data), so every access is guarded.

export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: settings simply won't persist.
  }
}

export function readNumber(key: string, fallback: number): number {
  const raw = readString(key);
  if (raw === null) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function readBoolean(key: string, fallback: boolean): boolean {
  const raw = readString(key);
  return raw === null ? fallback : raw === '1';
}

export function writeBoolean(key: string, value: boolean): void {
  writeString(key, value ? '1' : '0');
}
