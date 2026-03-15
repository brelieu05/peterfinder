import buildingCatalogue from "@/lib/utils/buildings";
import {
  type Coordinate,
  getDistanceBetweenCoordinates,
} from "@/lib/utils/distance";

export type ProximityStatus = "in" | "near" | "outside";

export interface ProximityResult {
  buildingName: string;
  proximity: ProximityStatus;
  distanceFeet: number;
}

/** Distance thresholds in feet: in ≤100, near ≤500, outside >500 */
const PROXIMITY_IN_FEET = 100;
const PROXIMITY_NEAR_FEET = 500;

/**
 * Finds the closest known building to a coordinate and returns proximity info.
 */
export function getProximityToBuilding(coord: Coordinate): ProximityResult {
  let closestBuildingName = "Unknown Location";
  let minDistance = Infinity;

  for (const [, building] of Object.entries(buildingCatalogue)) {
    const distance = getDistanceBetweenCoordinates(coord, {
      lat: building.lat,
      lng: building.lng,
    });
    if (distance < minDistance) {
      minDistance = distance;
      closestBuildingName = building.name;
    }
  }

  let proximity: ProximityStatus;
  if (minDistance <= PROXIMITY_IN_FEET) {
    proximity = "in";
  } else if (minDistance <= PROXIMITY_NEAR_FEET) {
    proximity = "near";
  } else {
    proximity = "outside";
  }

  return {
    buildingName: closestBuildingName,
    proximity,
    distanceFeet: minDistance,
  };
}

/**
 * Returns human-readable proximity text (e.g. "In Building Name", "Near X (50ft)").
 */
export function getProximityText(result: ProximityResult): string {
  const { buildingName, proximity, distanceFeet } = result;
  if (proximity === "in") {
    return `In ${buildingName}`;
  }
  if (proximity === "near") {
    return `Near ${buildingName} (${Math.round(distanceFeet)}ft)`;
  }
  return `Outside ${buildingName} (${Math.round(distanceFeet)}ft)`;
}

/**
 * Returns Tailwind text color classes for the proximity status.
 */
export function getProximityColorClasses(proximity: ProximityStatus): string {
  if (proximity === "in") {
    return "text-green-600 dark:text-green-400";
  }
  if (proximity === "near") {
    return "text-yellow-600 dark:text-yellow-400";
  }
  return "text-red-600 dark:text-red-400";
}
