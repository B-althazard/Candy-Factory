const LOCKS_KEY = "candy_factory_locks_v1";

export function loadLocks() {
  try {
    const raw = localStorage.getItem(LOCKS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr.map(String) : []);
  } catch {
    return new Set();
  }
}

export function saveLocks(lockSet) {
  try {
    const arr = Array.from(lockSet ?? []);
    localStorage.setItem(LOCKS_KEY, JSON.stringify(arr));
  } catch {
    // ignore
  }
}

export function lockPaths(lockSet, paths) {
  for (const p of (paths ?? [])) lockSet.add(String(p));
}

export function unlockPath(lockSet, path) {
  lockSet.delete(String(path));
}

export function clearLocks() {
  try { localStorage.removeItem(LOCKS_KEY); } catch {}
}
