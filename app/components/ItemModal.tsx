"use client";

import { RankedItem } from "../page";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RankedItem | null;
}

export function ItemModal({ isOpen, onClose, item }: ItemModalProps) {
  if (!item || !isOpen) return null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-zinc-900 rounded-xl max-w-lg w-full border border-zinc-800 shadow-2xl">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-2xl font-bold text-white">
            {item.name}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:bg-zinc-800 rounded-lg p-2 transition-colors"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-900">
              <span className="text-xl font-bold text-blue-300">
                #{item.rank}
              </span>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Ranking</p>
              <p className="text-xs text-zinc-500">
                Based on distance and recency
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-300 mb-1">
              Item Type
            </p>
            <span className="inline-block px-3 py-1 text-sm rounded-full bg-blue-900 text-blue-300 capitalize">
              {item.itemType}
            </span>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-300 mb-1">
              Description
            </p>
            <p className="text-sm text-zinc-400">{item.description}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-300 mb-1">
              Distance from You
            </p>
            <p className="text-sm text-zinc-400">
              {item.distance.toFixed(2)} km away
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-300 mb-1">Lost At</p>
            <p className="text-sm text-zinc-400">{formatDate(item.lostAt)}</p>
            <p className="text-xs text-zinc-500 mt-1">
              {item.hoursSinceLost.toFixed(0)} hours ago
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-300 mb-1">Location</p>
            <p className="text-sm text-zinc-400 font-mono">
              {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
