import { RankedItem } from "@/app/page";
import { useMemo } from "react";
import {
  getProximityToBuilding,
  getProximityText,
  getProximityColorClasses,
} from "@/lib/utils/proximity";

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

interface ItemCardProps {
  item: RankedItem;
  selectedType: ItemType | "all";
  onClick?: (item: RankedItem) => void;
}

export function ItemCard({ item, selectedType, onClick }: ItemCardProps) {
  const proximityResult = useMemo(
    () =>
      getProximityToBuilding({ lat: item.latitude, lng: item.longitude }),
    [item.latitude, item.longitude]
  );

  return (
    <div
      className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      onClick={() => onClick?.(item)}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-300">
            {item.rank}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              {item.name}
            </h3>
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                selectedType === item.itemType
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
              }`}
            >
              {item.itemType}
            </span>
          </div>
          <p className="text-sm text-zinc-500">
            {item.description}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            {item.distance.toFixed(1)} mi away • Lost{" "}
            {item.hoursSinceLost.toFixed(0)} hours ago
          </p>
          <p
            className={`text-xs font-medium mt-1 ${getProximityColorClasses(proximityResult.proximity)}`}
          >
            📍 {getProximityText(proximityResult)}
          </p>
        </div>
      </div>
    </div>
  );
}
