"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useUserLocation } from "@/lib/hooks/useUserLocation";
import { AddItemModal } from "@/app/components/AddItemModal";
import { ItemModal } from "@/app/components/ItemModal";
import { MapSection } from "@/app/components/MapSection";
import { DashboardSection } from "@/app/components/DashboardSection";

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

interface LostItem {
  id: string;
  name: string;
  description: string;
  itemType: ItemType;
  latitude: number;
  longitude: number;
  lostAt: Date;
  email: string;
  islost: boolean;
}

interface ApiItem {
  id: number;
  name: string;
  description: string;
  type: string;
  location: string[];
  itemdate: string;
  email?: string;
  islost: boolean;
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateHoursSinceLost(lostAt: Date): number {
  const now = new Date();
  return (now.getTime() - lostAt.getTime()) / (1000 * 60 * 60);
}

export interface RankedItem extends LostItem {
  rank: number;
  distance: number;
  hoursSinceLost: number;
}

export default function Home() {
  const { location, loading: locationLoading } = useUserLocation();
  const [selectedType, setSelectedType] = useState<ItemType | "all">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showLostItems, setShowLostItems] = useState(true);
  const [items, setItems] = useState<LostItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [selectedItem, setSelectedItem] = useState<RankedItem | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const fetchItemsFromDB = useCallback(async () => {
    setIsLoadingItems(true);
    try {
      const response = await fetch(`/api/items?islost=${showLostItems}`);
      if (!response.ok) {
        throw new Error("Failed to fetch items");
      }
      const { data } = await response.json();
      
      const formattedItems: LostItem[] = data.map((item: ApiItem) => ({
        id: item.id.toString(),
        name: item.name,
        description: item.description,
        itemType: item.type as ItemType,
        latitude: parseFloat(item.location[0]),
        longitude: parseFloat(item.location[1]),
        lostAt: new Date(item.itemdate),
        email: item.email || '',
        islost: item.islost,
      }));
      
      setItems(formattedItems);
    } catch (error) {
      console.error("Error fetching items:", error);
      setItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  }, [showLostItems]);

  useEffect(() => {
    setItems([]);
    fetchItemsFromDB();
  }, [fetchItemsFromDB]);

  const rankedItems = useMemo((): RankedItem[] => {
    if (!location) return [];

    const itemsWithMetrics = items.map((item) => ({
      ...item,
      distance: calculateDistance(
        location.latitude,
        location.longitude,
        item.latitude,
        item.longitude
      ),
      hoursSinceLost: calculateHoursSinceLost(item.lostAt),
    }));

    const maxDistance = Math.max(...itemsWithMetrics.map((i) => i.distance));
    const maxHours = Math.max(...itemsWithMetrics.map((i) => i.hoursSinceLost));

    const sorted = itemsWithMetrics.sort((a, b) => {
      const distanceScoreA = a.distance / maxDistance;
      const distanceScoreB = b.distance / maxDistance;
      const recencyScoreA = a.hoursSinceLost / maxHours;
      const recencyScoreB = b.hoursSinceLost / maxHours;

      const typeBoostA =
        selectedType !== "all" && a.itemType === selectedType ? -1 : 0;
      const typeBoostB =
        selectedType !== "all" && b.itemType === selectedType ? -1 : 0;

      const scoreA = distanceScoreA + recencyScoreA + typeBoostA;
      const scoreB = distanceScoreB + recencyScoreB + typeBoostB;

      return scoreA - scoreB;
    });

    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [selectedType, location, items]);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col lg:flex-row lg:h-screen">
        <MapSection items={rankedItems} hasLocation={!!location} />

        <DashboardSection
          showLostItems={showLostItems}
          onToggleLostFound={setShowLostItems}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          isLoadingItems={isLoadingItems}
          locationLoading={locationLoading}
          hasLocation={!!location}
          items={rankedItems}
          itemCount={items.length}
          onItemClick={(item) => {
            setSelectedItem(item);
            setIsItemModalOpen(true);
          }}
        />
      </div>

      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full shadow-lg transition-colors flex items-center justify-center"
        aria-label="Add item"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </button>

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onItemAdded={() => {
          fetchItemsFromDB();
        }}
      />

      <ItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
      />
    </div>
  );
}
