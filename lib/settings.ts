const STORAGE_KEY = "peterfinder-settings";

export type NearbyRadiusMiles = "all" | 0.25 | 0.5 | 0.75 | 1 | 1.5;

export interface UserSettings {
  foundNotifications: boolean;
  defaultView: "lost" | "found";
  nearbyRadiusMiles: NearbyRadiusMiles;
  useAutomaticLocation: boolean;
}

export const defaultSettings: UserSettings = {
  foundNotifications: true,
  defaultView: "lost",
  nearbyRadiusMiles: "all",
  useAutomaticLocation: true,
};

export function loadSettings(): UserSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
