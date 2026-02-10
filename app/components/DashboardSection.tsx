import { ItemCard } from "@/app/components/ItemCard";
import { RankedItem } from "@/app/page";

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
  isLoadingItems,
  locationLoading,
  hasLocation,
  items,
  itemCount,
  onItemClick,
}: DashboardSectionProps) {
  return (
    <main className="w-full lg:w-1/2 flex flex-col gap-8 py-8 px-4 lg:px-8 bg-white dark:bg-black overflow-y-auto">
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
            Lost
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
            Found
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
      {hasLocation && items.length > 0 && (
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
