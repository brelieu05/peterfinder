"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/app/components/Logo";
import {
  loadSettings,
  saveSettings,
  defaultSettings,
  type UserSettings,
} from "@/lib/settings";

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <div className="max-w-lg mx-auto py-12 px-6">
        <div className="flex items-center justify-between mb-10">
          <Logo size="sm" asLink />
          <Link
            href="/"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            ← Back to home
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          User Settings
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-3">
            <input
              id="foundNotifications"
              type="checkbox"
              checked={settings.foundNotifications}
              onChange={(e) => update("foundNotifications", e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="foundNotifications"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Notify me when someone finds my item
            </label>
          </div>

          <div>
            <label
              htmlFor="defaultView"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Default view when I open the app
            </label>
            <select
              id="defaultView"
              value={settings.defaultView}
              onChange={(e) =>
                update("defaultView", e.target.value as "lost" | "found")
              }
              className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="found">I&apos;ve lost something</option>
              <option value="lost">I&apos;ve found something</option>
            </select>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Save preferences
            </button>
            {saved && (
              <span className="text-sm text-green-600 dark:text-green-400">
                Saved!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
