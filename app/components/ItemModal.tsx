"use client";

import { RankedItem } from "../page";
import { useState } from "react";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RankedItem | null;
}

export function ItemModal({ isOpen, onClose, item }: ItemModalProps) {
  const [copied, setCopied] = useState(false);

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

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(item.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <div className="relative bg-zinc-900 rounded-xl max-w-lg w-full border border-zinc-800 shadow-2xl">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-2xl font-bold text-white">
            {item.name}
          </h2>
          <button
            onClick={handleClose}
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
              {item.distance.toFixed(2)} mi away
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

          {/* Contact Information */}
          <div className="border-t border-zinc-700 pt-4 mt-4">
            <p className="text-sm font-medium text-zinc-300 mb-3">
              Contact Information
            </p>
            
            <div className="space-y-3">
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <p className="text-xs text-zinc-400 mb-1">
                  {item.islost ? "Reporter's Email:" : "Finder's Email:"}
                </p>
                <p className="text-lg font-mono text-white break-all">
                  {item.email}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`mailto:${item.email}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-center transition-colors flex items-center justify-center gap-2"
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
                <button
                  onClick={handleCopyEmail}
                  className={`px-4 py-2 rounded-lg transition-colors text-white cursor-pointer ${
                    copied 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-zinc-700 hover:bg-zinc-600'
                  }`}
                  title={copied ? "Copied!" : "Copy email"}
                >
                  {copied ? (
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
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  ) : (
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
                        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
