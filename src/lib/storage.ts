const STORAGE_KEY = 'pakaitools_recent_tools';
const MAX_RECENT = 6;

export function getRecentToolIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(item => typeof item === 'string').slice(0, MAX_RECENT);
    }
    return [];
  } catch {
    // Graceful fallback if cookies/storage disabled
    return [];
  }
}

export function saveRecentToolId(toolId: string): void {
  try {
    const current = getRecentToolIds();
    const updated = [toolId, ...current.filter(id => id !== toolId)].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota or disabled errors
  }
}
