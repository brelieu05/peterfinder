"use client";

import { useEffect, useState, useMemo } from "react";

type ItemType = "wallet" | "keys" | "phone" | "bag" | "glasses" | "jewelry" | "electronics" | "clothing" | "other";

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

interface LostItem {
  id: string;
  name: string;
  description: string;
  itemType: ItemType;
  latitude: number;
  longitude: number;
  lostAt: Date;
}

const sampleLostItems: LostItem[] = [
  {
    id: "1",
    name: "Blue Wallet",
    description: "Leather wallet with ID and credit cards",
    itemType: "wallet",
    latitude: 37.7749,
    longitude: -122.4194,
    lostAt: new Date("2026-01-28T14:30:00"),
  },
  {
    id: "2",
    name: "Car Keys",
    description: "Honda keys with a red keychain",
    itemType: "keys",
    latitude: 37.7851,
    longitude: -122.4056,
    lostAt: new Date("2026-01-29T09:15:00"),
  },
  {
    id: "3",
    name: "iPhone 15",
    description: "Black iPhone with cracked screen protector",
    itemType: "phone",
    latitude: 37.7694,
    longitude: -122.4862,
    lostAt: new Date("2026-01-29T18:45:00"),
  },
  {
    id: "4",
    name: "Backpack",
    description: "Gray North Face backpack with laptop inside",
    itemType: "bag",
    latitude: 37.8044,
    longitude: -122.2712,
    lostAt: new Date("2026-01-30T08:00:00"),
  },
  {
    id: "5",
    name: "Prescription Glasses",
    description: "Black frame glasses in a brown case",
    itemType: "glasses",
    latitude: 37.7599,
    longitude: -122.4148,
    lostAt: new Date("2026-01-30T11:20:00"),
  },
];

// Calculate distance between two coordinates using Haversine formula (returns km)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
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

// Calculate hours since the item was lost
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
  const [userData, setUserData] = useState<{ latitude: number; longitude: number; timestamp: Date } | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<ItemType | "all">("all");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserData({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date(),
          });
        },
        (error) => {
          console.error("Error getting location:", error.message);
        }
      );
    }
  }, []);

  // Rank items based on distance, recency, and item type match
  const rankedItems = useMemo((): RankedItem[] => {
    if (!userData) return [];

    // Calculate distance and hours for each item
    const itemsWithMetrics = sampleLostItems.map((item) => ({
      ...item,
      distance: calculateDistance(userData.latitude, userData.longitude, item.latitude, item.longitude),
      hoursSinceLost: calculateHoursSinceLost(item.lostAt),
    }));

    // Normalize distance and recency to 0-1 scale for fair comparison
    const maxDistance = Math.max(...itemsWithMetrics.map((i) => i.distance));
    const maxHours = Math.max(...itemsWithMetrics.map((i) => i.hoursSinceLost));

    // Sort by combined normalized score (lower = better)
    // If a type is selected, matching items get a significant boost (lower score)
    const sorted = itemsWithMetrics.sort((a, b) => {
      // Base scores from distance and recency (each weighted 0.5)
      const distanceScoreA = a.distance / maxDistance;
      const distanceScoreB = b.distance / maxDistance;
      const recencyScoreA = a.hoursSinceLost / maxHours;
      const recencyScoreB = b.hoursSinceLost / maxHours;

      // Type match bonus: if selected type matches, subtract 1 from score (significant boost)
      const typeBoostA = selectedType !== "all" && a.itemType === selectedType ? -1 : 0;
      const typeBoostB = selectedType !== "all" && b.itemType === selectedType ? -1 : 0;

      const scoreA = distanceScoreA + recencyScoreA + typeBoostA;
      const scoreB = distanceScoreB + recencyScoreB + typeBoostB;
      
      return scoreA - scoreB;
    });

    // Assign ranks (1st, 2nd, 3rd, etc.)
    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [userData, selectedType]);

  // Log ranked items for debugging
  useEffect(() => {
    if (rankedItems.length > 0) {
      console.log("Ranked items:", rankedItems);
    }
  }, [rankedItems]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center gap-8 py-16 px-8 bg-white dark:bg-black">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Lost Items Near You</h1>
        
        <div className="w-full">
          <label htmlFor="itemType" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Filter by item type
          </label>
          <select
            id="itemType"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ItemType | "all")}
            className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {itemTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {!userData && (
          <p className="text-zinc-500">Loading your location...</p>
        )}

        {userData && rankedItems.length > 0 && (
          <div className="w-full space-y-4">
            {rankedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-300">
                      {item.rank}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-zinc-900 dark:text-white">{item.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        selectedType === item.itemType 
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                      }`}>
                        {item.itemType}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500">{item.description}</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {item.distance.toFixed(1)} km away • Lost {item.hoursSinceLost.toFixed(0)} hours ago
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
