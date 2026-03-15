"use client";

import { useEffect, useState, useRef } from "react";

export interface UserLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number;
  isStale: boolean;
}

interface UseUserLocationResult {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
}

const DEBOUNCE_MS = 3000;
const STALE_MS = 30_000;

const watchOptions: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 10_000,
  timeout: 15_000,
};

function errorMessageFromCode(code: number): string {
  switch (code) {
    case 1:
      return "Location permission denied.";
    case 2:
      return "Location unavailable.";
    case 3:
      return "Location request timed out.";
    default:
      return "Location unavailable.";
  }
}

function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const staleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      const timestamp = position.timestamp;

      if (staleTimerRef.current) {
        clearTimeout(staleTimerRef.current);
        staleTimerRef.current = null;
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        const next: UserLocation = {
          latitude,
          longitude,
          timestamp,
          accuracy: accuracy ?? 0,
          isStale: false,
        };
        setLocation(next);
        setLoading(false);
        setError(null);

        staleTimerRef.current = setTimeout(() => {
          staleTimerRef.current = null;
          setLocation((prev) =>
            prev ? { ...prev, isStale: true } : prev
          );
        }, STALE_MS);
      }, DEBOUNCE_MS);
    };

    const onError = (err: GeolocationPositionError) => {
      setError(errorMessageFromCode(err.code));
      setLoading(false);
    };

    const watchId = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      watchOptions
    );

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (staleTimerRef.current) {
        clearTimeout(staleTimerRef.current);
        staleTimerRef.current = null;
      }
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { location, loading, error };
}

export { useUserLocation };
export default useUserLocation;
