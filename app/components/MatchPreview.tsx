"use client";

import { useEffect, useState } from "react";
import { ItemMatch } from "@/lib/utils/matching";
import {
  getProximityToBuilding,
  getProximityText,
  getProximityColorClasses,
} from "@/lib/utils/proximity";

interface MatchPreviewProps {
  lostItemName: string;
  matches: ItemMatch[];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function CopyButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={`px-3 py-1.5 rounded-lg transition-colors text-white text-xs cursor-pointer ${
        copied ? "bg-green-600 hover:bg-green-700" : "bg-zinc-700 hover:bg-zinc-600"
      }`}
      title={copied ? "Copied!" : "Copy email"}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function MatchDetailView({
  match,
  onBack,
}: {
  match: ItemMatch;
  onBack: () => void;
}) {
  const { item, score } = match;
  const proximityResult =
    item.location?.length >= 2
      ? getProximityToBuilding({
          lat: parseFloat(item.location[0]),
          lng: parseFloat(item.location[1]),
        })
      : null;

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path
            fillRule="evenodd"
            d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
        Back to matches
      </button>

      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="text-lg font-bold text-white">{item.name}</h3>
        <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-zinc-700 text-zinc-200 capitalize">
          {item.type}
        </span>
      </div>

      <div>
        <p className="text-xs font-medium text-zinc-400 mb-1">Description</p>
        <p className="text-sm text-zinc-200">{item.description}</p>
      </div>

      <div>
        <p className="text-xs font-medium text-zinc-400 mb-1">Date Found</p>
        <p className="text-sm text-zinc-200">{formatDate(item.itemdate)}</p>
      </div>

      <div>
        <p className="text-xs font-medium text-zinc-400 mb-1">Location</p>
        {proximityResult ? (
          <p className={`text-sm font-medium ${getProximityColorClasses(proximityResult.proximity)}`}>
            📍 {getProximityText(proximityResult)}
          </p>
        ) : (
          <p className="text-sm text-zinc-500">Location unavailable</p>
        )}
      </div>

      <div className="border-t border-zinc-700 pt-4">
        <p className="text-xs font-medium text-zinc-400 mb-2">Contact Finder</p>
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 mb-3">
          <p className="text-xs text-zinc-400 mb-0.5">Finder&apos;s Email</p>
          <p className="text-sm font-mono text-white break-all">{item.email}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`mailto:${item.email}`}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-center text-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
            Open Email
          </a>
          <CopyButton email={item.email} />
        </div>
      </div>
    </div>
  );
}

function MatchListView({
  matches,
  onSelect,
}: {
  matches: ItemMatch[];
  onSelect: (match: ItemMatch) => void;
}) {
  return (
    <div className="space-y-2">
      {matches.map((match, index) => (
        <div
          key={match.item.id}
          className="rounded-lg border border-emerald-800/50 bg-emerald-950/30 p-3"
        >
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-900 shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-300">#{index + 1}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-medium text-sm text-white truncate">
                  {match.item.name}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-zinc-800 text-zinc-200 capitalize shrink-0">
                  {match.item.type}
                </span>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2">
                {match.item.description}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Found {formatDate(match.item.itemdate)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <a
                  href={`mailto:${match.item.email}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
                    <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
                  </svg>
                  Contact finder
                </a>
                <button
                  onClick={() => onSelect(match)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
                >
                  View details
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MatchPreview({ lostItemName, matches }: MatchPreviewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<ItemMatch | null>(null);

  useEffect(() => {
    if (!dialogOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedMatch) {
          setSelectedMatch(null);
        } else {
          setDialogOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogOpen, selectedMatch]);

  const handleClose = () => {
    setDialogOpen(false);
    setSelectedMatch(null);
  };

  if (matches.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setDialogOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        {matches.length} possible match{matches.length === 1 ? "" : "es"} found
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-3.5 h-3.5"
        >
          <path
            fillRule="evenodd"
            d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="relative bg-zinc-900 rounded-xl max-w-lg w-full border border-zinc-800 shadow-2xl flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="flex items-start justify-between p-5 pb-4 border-b border-zinc-800 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {selectedMatch ? selectedMatch.item.name : "Possible Matches"}
                </h2>
                {!selectedMatch && (
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Found items matching &ldquo;{lostItemName}&rdquo; &mdash; ranked by similarity
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="text-zinc-400 hover:bg-zinc-800 rounded-lg p-1.5 transition-colors ml-4 shrink-0"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-5">
              {selectedMatch ? (
                <MatchDetailView
                  match={selectedMatch}
                  onBack={() => setSelectedMatch(null)}
                />
              ) : (
                <MatchListView matches={matches} onSelect={setSelectedMatch} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
