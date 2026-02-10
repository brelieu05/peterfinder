/**
 * Represents a geographic coordinate with latitude and longitude
 */
export interface Coordinate {
    lat: number;
    lng: number;
}

/**
 * Calculates the distance between two geographic coordinates using the Haversine formula
 * @param coord1 First coordinate {lat, lng}
 * @param coord2 Second coordinate {lat, lng}
 * @returns Distance in feet
 */
export function getDistanceBetweenCoordinates(
    coord1: Coordinate,
    coord2: Coordinate
): number {
    const EARTH_RADIUS_FEET = 20902231; // Earth's radius in feet (approximately 3,959 miles)

    // Convert latitude and longitude from degrees to radians
    const lat1Rad = toRadians(coord1.lat);
    const lat2Rad = toRadians(coord2.lat);
    const deltaLatRad = toRadians(coord2.lat - coord1.lat);
    const deltaLngRad = toRadians(coord2.lng - coord1.lng);

    // Haversine formula
    const a =
        Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
        Math.cos(lat1Rad) *
            Math.cos(lat2Rad) *
            Math.sin(deltaLngRad / 2) *
            Math.sin(deltaLngRad / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Distance in feet
    const distance = EARTH_RADIUS_FEET * c;

    return distance;
}

/**
 * Checks if two coordinates are within a specified distance of each other
 * @param coord1 First coordinate {lat, lng}
 * @param coord2 Second coordinate {lat, lng}
 * @param radiusFeet Maximum distance in feet
 * @returns true if the coordinates are within the specified radius, false otherwise
 */
export function isWithinRadius(
    coord1: Coordinate,
    coord2: Coordinate,
    radiusFeet: number
): boolean {
    const distance = getDistanceBetweenCoordinates(coord1, coord2);
    return distance <= radiusFeet;
}

/**
 * Helper function to convert degrees to radians
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Finds all buildings within a specified radius of a given coordinate
 * @param targetCoord The coordinate to search from {lat, lng}
 * @param buildings Record of building IDs to Building objects
 * @param radiusFeet Search radius in feet
 * @returns Array of building IDs that are within the radius
 */
export function findBuildingsWithinRadius(
    targetCoord: Coordinate,
    buildings: Record<string, { lat: number; lng: number }>,
    radiusFeet: number
): string[] {
    const nearbyBuildings: string[] = [];

    for (const [buildingId, building] of Object.entries(buildings)) {
        if (isWithinRadius(targetCoord, building, radiusFeet)) {
            nearbyBuildings.push(buildingId);
        }
    }

    return nearbyBuildings;
}
