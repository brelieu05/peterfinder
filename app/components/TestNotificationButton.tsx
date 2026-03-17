"use client";

import { useState } from "react";

export function TestNotificationButton() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const send = async () => {
    setState("loading");
    try {
      const res = await fetch("/api/notifications/test", { method: "POST" });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
    setTimeout(() => setState("idle"), 3000);
  };

  return (
    <button
      onClick={send}
      disabled={state === "loading"}
      className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
        state === "done"
          ? "bg-green-700 text-green-100"
          : state === "error"
          ? "bg-red-800 text-red-100"
          : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
      }`}
    >
      {state === "loading"
        ? "Sending…"
        : state === "done"
        ? "Notification sent! Check the bell."
        : state === "error"
        ? "Failed — try again"
        : "Send test notification"}
    </button>
  );
}
