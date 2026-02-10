"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import buildingCatalogue, { Building } from "@/lib/utils/buildings";

interface LocationSearchBarProps {
  onLocationSelect: (building: Building | null) => void;
  selectedBuilding: Building | null;
}

export function LocationSearchBar({
  onLocationSelect,
  selectedBuilding,
}: LocationSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Get all buildings as an array
  const allBuildings = useMemo(() => {
    return Object.values(buildingCatalogue);
  }, []);

  // Filter buildings based on search query
  const filteredBuildings = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return allBuildings
      .filter((building) => building.name.toLowerCase().includes(query))
      .slice(0, 10); // Limit to 10 results
  }, [searchQuery, allBuildings]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (building: Building) => {
    setSearchQuery(building.name);
    onLocationSelect(building);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchQuery("");
    onLocationSelect(null);
    setIsOpen(false);
  };

  return (
    <div className="w-full" ref={wrapperRef}>
      <label
        htmlFor="locationSearch"
        className="block text-sm font-medium mb-2"
        style={{ color: "#ffffff" }}
      >
        Filter by building location
      </label>
      <div className="relative">
        <div className="relative">
          <input
            id="locationSearch"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search for a building (e.g., Science Library)..."
            className="w-full p-3 pr-10 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{ color: "#ffffff" }}
          />
          {(searchQuery || selectedBuilding) && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              aria-label="Clear search"
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
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && searchQuery && filteredBuildings.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredBuildings.map((building, index) => (
              <button
                key={`${building.name}-${index}`}
                onClick={() => handleSelect(building)}
                className="w-full text-left px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors border-b border-zinc-200 dark:border-zinc-700 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-blue-500 shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                  <span className="text-zinc-900 dark:text-white text-sm">
                    {building.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results message */}
        {isOpen && searchQuery && filteredBuildings.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-lg p-4">
            <p className="text-sm text-zinc-500">
              No buildings found matching &quot;{searchQuery}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Selected Building Display */}
      {selectedBuilding && (
        <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Filtering items near {selectedBuilding.name}</span>
        </div>
      )}
    </div>
  );
}
