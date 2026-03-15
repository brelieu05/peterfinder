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

const DEBOUNCE_MS = 1500; // Shorter so first fix appears before intermittent errors
const STALE_MS = 30_000;

const watchOptions: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 15_000, // Use cached position longer when device hiccups
  timeout: 20_000,
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
  const locationRef = useRef<UserLocation | null>(null);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
   setError("Geolocation is not supported by this browser.");
   setLoading(false);
   return;
  }

  const onSuccess = (position: GeolocationPosition) => {
   try {
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
     locationRef.current = next;
    setLocation(next);
    setLoading(false);
    setError(null);

    staleTimerRef.current = setTimeout(() => {
      staleTimerRef.current = null;
      setLocation((prev) => (prev ? { ...prev, isStale: true } : prev));
     }, STALE_MS);
    }, DEBOUNCE_MS);
   } catch {
    setError("Location temporarily unavailable.");
    setLoading(false);
   }
  };

  const onError = (err: GeolocationPositionError) => {
    const code = err?.code ?? 2;
    setLoading(false);
    // Code 2 = POSITION_UNAVAILABLE (e.g. kCLErrorLocationUnknown) often fires
    // intermittently. If we already have a position, keep using it and mark stale
    // instead of showing "Location unavailable".
    if (code === 2 && locationRef.current) {
      setLocation((prev) => (prev ? { ...prev, isStale: true } : prev));
      setError(null);
      return;
    }
    try {
      setError(errorMessageFromCode(code));
    } catch {
      setError("Location temporarily unavailable.");
    }
  };

  let watchId: number | null = null;
  try {
   watchId = navigator.geolocation.watchPosition(
    onSuccess,
    onError,
    watchOptions,
   );
  } catch {
   setError("Location temporarily unavailable.");
   setLoading(false);
  }

  return () => {
   if (debounceTimerRef.current) {
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = null;
   }
   if (staleTimerRef.current) {
    clearTimeout(staleTimerRef.current);
    staleTimerRef.current = null;
   }
   if (watchId != null) {
    navigator.geolocation.clearWatch(watchId);
   }
  };
 }, []);

 return { location, loading, error };
}

export { useUserLocation };
export default useUserLocation;
