import Link from "next/link";
import { ItemCard } from "@/app/components/ItemCard";
import { LocationSearchBar } from "@/app/components/LocationSearchBar";
import { RankedItem } from "@/app/page";
import { Building } from "@/lib/utils/buildings";

type ItemType =
  | "wallet"
  | "keys"
  | "phone"
  | "bag"
  | "glasses"
  | "jewelry"
  | "electronics"
  | "clothing"
  | "other";

const itemTypes: { value: ItemType | "all"; label: string }[] = [
  { value: "all", label: "All Items" },
  { value: "wallet", label: "Wallet" },
  { value: "keys", label: "Keys" },
  { value: "phone", label: "Phone" },
  { value: "bag", label: "Bag" },
  { value: "glasses", label: "Glasses" },
  { value: "jewelry", label: "Jewelry" },
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "other", label: "Other" },
];

interface DashboardSectionProps {
  showLostItems: boolean;
  onToggleLostFound: (isLost: boolean) => void;
  selectedType: ItemType | "all";
  onTypeChange: (type: ItemType | "all") => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedBuilding: Building | null;
  onBuildingSelect: (building: Building | null) => void;
  isLoadingItems: boolean;
  locationLoading: boolean;
  hasLocation: boolean;
  items: RankedItem[];
  itemCount: number;
  onItemClick?: (item: RankedItem) => void;
}

export function DashboardSection({
  showLostItems,
  onToggleLostFound,
  selectedType,
  onTypeChange,
  searchQuery,
  onSearchChange,
  selectedBuilding,
  onBuildingSelect,
  isLoadingItems,
  locationLoading,
  hasLocation,
  items,
  itemCount,
  onItemClick,
}: DashboardSectionProps) {
  return (
    <main className="w-full lg:w-1/2 flex flex-col gap-8 py-8 px-4 lg:px-8 bg-white dark:bg-black overflow-y-auto">
      {/* Brand Logo + Settings link */}
      <div className="flex items-center justify-between mb-[-1rem]">
        <div className="flex items-center gap-2 group cursor-default">
          <div className="flex items-end">
            <span className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400 lowercase">
              peter
            </span>
            <span className="text-3xl font-medium tracking-tight text-zinc-500 dark:text-zinc-400 lowercase">
              finder
            </span>
            <span className="text-2xl ml-1 group-hover:rotate-12 transition-transform duration-300">
              🔍
            </span>
          </div>
        </div>
        <Link
          href="/settings"
          className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Settings
        </Link>
      </div>

      {/* Header with Lost/Found Toggle */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
          {showLostItems ? "Lost" : "Found"} Items Near You
        </h1>

        <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => onToggleLostFound(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showLostItems ? "bg-blue-900" : ""
            }`}
            style={{
              color: showLostItems ? "#60a5fa" : "#ffffff",
            }}
          >
            I&apos;ve found something!
          </button>
          <button
            onClick={() => onToggleLostFound(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !showLostItems ? "bg-blue-900" : ""
            }`}
            style={{
              color: !showLostItems ? "#60a5fa" : "#ffffff",
            }}
          >
            I&apos;ve lost something!
          </button>
        </div>
      </div>

      {/* Filter Dropdown */}
      <div className="w-full">
        <label
          htmlFor="itemType"
          className="block text-sm font-medium mb-2"
          style={{ color: "#ffffff" }}
        >
          Filter by item type
        </label>
        <select
          id="itemType"
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value as ItemType | "all")}
          className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          style={{ color: "#ffffff" }}
        >
          {itemTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Text Search Section */}
      <div className="w-full">
        <label
          htmlFor="textSearch"
          className="block text-sm font-medium mb-2"
          style={{ color: "#ffffff" }}
        >
          Search items by name
        </label>
        <div className="relative">
          <input
            id="textSearch"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search for an item (e.g., Blue Wallet)..."
            className="w-full p-3 pr-10 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{ color: "#ffffff" }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
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
      </div>

      {/* Location Search Bar */}
      <LocationSearchBar
        onLocationSelect={onBuildingSelect}
        selectedBuilding={selectedBuilding}
      />

      {/* Loading States */}
      {isLoadingItems && <p className="text-zinc-500">Loading items...</p>}

      {locationLoading && (
        <p className="text-zinc-500">Loading your location...</p>
      )}

      {!locationLoading && !hasLocation && (
        <p className="text-zinc-500">
          Location unavailable. Showing items without location ranking.
        </p>
      )}

      {/* Empty State */}
      {!isLoadingItems && itemCount === 0 && (
        <p className="text-zinc-500">
          No {showLostItems ? "lost" : "found"} items found.
        </p>
      )}

      {/* Items List */}
      {(hasLocation || selectedBuilding) && items.length > 0 && (
        <div className="w-full space-y-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              selectedType={selectedType}
              onClick={onItemClick}
            />
          ))}
        </div>
      )}
    </main>
  );
}
